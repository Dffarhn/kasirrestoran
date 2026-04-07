// Supabase Edge Function: kirim notifikasi pesanan baru ke kasir (FCM HTTP v1)
// Dedupe: satu fcm_token per toko hanya dikirimi sekali walau ada duplikat di DB.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type KasirTokenRow = {
  fcm_token: string;
  user_id: string;
  device_type: string | null;
};

function dedupeKasirTokens(rows: KasirTokenRow[]): KasirTokenRow[] {
  const seen = new Set<string>();
  const out: KasirTokenRow[] = [];
  for (const row of rows) {
    const key = row.fcm_token?.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_id, toko_id, customer_name, total_amount, created_at } =
      await req.json();

    if (!order_id || !toko_id || !customer_name || !total_amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing required fields: order_id, toko_id, customer_name, total_amount",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log(`Fetching FCM tokens for toko: ${toko_id}`);
    const { data: rawTokens, error: tokensError } = await supabase
      .from("kasir_fcm_tokens")
      .select("fcm_token, user_id, device_type")
      .eq("toko_id", toko_id)
      .eq("is_active", true);

    if (tokensError) {
      console.error("Error fetching kasir tokens:", tokensError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to fetch kasir tokens",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    const kasirTokens = dedupeKasirTokens((rawTokens ?? []) as KasirTokenRow[]);
    if ((rawTokens?.length ?? 0) !== kasirTokens.length) {
      console.log(
        `Deduped FCM tokens by fcm_token: ${rawTokens?.length ?? 0} -> ${kasirTokens.length}`,
      );
    }

    if (kasirTokens.length === 0) {
      console.log("No active kasir tokens found for toko:", toko_id);
      return new Response(
        JSON.stringify({
          success: false,
          error: "No active kasir found for this toko",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        },
      );
    }

    const title = "Pesanan Baru Masuk! 🛒";
    const body = `${customer_name} - Rp ${total_amount.toLocaleString("id-ID")}`;

    const results: Record<string, unknown>[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const tokenData of kasirTokens) {
      try {
        console.log(`Sending notification to kasir: ${tokenData.user_id}`);
        const result = await sendFCMPushNotification(
          tokenData.fcm_token,
          title,
          body,
          {
            order_id: String(order_id),
            toko_id: String(toko_id),
            user_id: String(tokenData.user_id),
            type: "new_order",
            timestamp: String(created_at || new Date().toISOString()),
            customer_name: String(customer_name),
            total_amount: String(total_amount),
            deep_link: "online-orders",
          },
        );
        successCount++;
        results.push({
          success: true,
          user_id: tokenData.user_id,
          device_type: tokenData.device_type,
          messageId: result,
        });
        console.log(`Notification sent successfully to ${tokenData.user_id}`);
      } catch (error) {
        failureCount++;
        const err = error as Error;
        console.error(`Error sending notification to ${tokenData.user_id}:`, err);
        const errorMessage = err.message || "";
        const isUnregistered =
          errorMessage.includes("UNREGISTERED") ||
          errorMessage.includes("404") ||
          (errorMessage.includes("error") && errorMessage.includes("NOT_FOUND"));

        if (isUnregistered) {
          try {
            await supabase
              .from("kasir_fcm_tokens")
              .update({ is_active: false })
              .eq("fcm_token", tokenData.fcm_token);
            console.log(
              `Marked token as inactive for user ${tokenData.user_id} (UNREGISTERED)`,
            );
          } catch (dbError) {
            console.error(`Failed to mark token as inactive:`, dbError);
          }
        }
        results.push({
          success: false,
          user_id: tokenData.user_id,
          device_type: tokenData.device_type,
          error: err.message,
          is_unregistered: isUnregistered,
        });
      }
    }

    console.log("Order notification sent:", {
      order_id,
      toko_id,
      total_kasir: kasirTokens.length,
      success_count: successCount,
      failure_count: failureCount,
      customer_name,
      total_amount,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        order_id,
        toko_id,
        total_kasir: kasirTokens.length,
        success_count: successCount,
        failure_count: failureCount,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

async function sendFCMPushNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
) {
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
  const accessToken = await getAccessToken([
    "https://www.googleapis.com/auth/firebase.messaging",
  ]);

  const message = {
    message: {
      token,
      notification: { title, body },
      data,
      webpush: {
        headers: { Urgency: "high", TTL: "86400" },
        notification: {
          title,
          body,
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200],
          tag: `order_${data.order_id}`,
          renotify: true,
          actions: [
            { action: "view", title: "Lihat Pesanan", icon: "/icon-192x192.png" },
            { action: "dismiss", title: "Tutup" },
          ],
        },
        fcm_options: { link: "/online-orders" },
      },
      android: {
        notification: {
          title,
          body,
          icon: "ic_launcher",
          color: "#FF2E2E",
          sound: "default",
          channelId: "order_notifications",
          tag: `order_${data.order_id}`,
        },
        data,
      },
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            badge: 1,
            sound: "default",
            category: "ORDER_CATEGORY",
          },
        },
      },
    },
  };

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`FCM API error: ${response.status} ${errText}`);
  }

  const result = await response.json();
  return result.name;
}

async function getAccessToken(scopes: string[]) {
  const serviceAccount = {
    type: "service_account",
    project_id: Deno.env.get("FIREBASE_PROJECT_ID"),
    private_key_id: Deno.env.get("FIREBASE_PRIVATE_KEY_ID"),
    private_key: Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
    client_email: Deno.env.get("FIREBASE_CLIENT_EMAIL"),
    client_id: Deno.env.get("FIREBASE_CLIENT_ID"),
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${Deno.env.get("FIREBASE_CLIENT_EMAIL")}`,
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: scopes.join(" "),
    aud: serviceAccount.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  const pemToArrayBuffer = (pem: string) => {
    if (!pem || typeof pem !== "string") {
      throw new Error("Invalid private key: empty");
    }
    let normalized = pem.trim();
    normalized = normalized
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace("-----BEGIN RSA PRIVATE KEY-----", "")
      .replace("-----END RSA PRIVATE KEY-----", "");
    const base64 = normalized.replace(/\r|\n|\s/g, "");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const keyData = pemToArrayBuffer(serviceAccount.private_key!);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  );
  const encodedSignature = btoa(
    String.fromCharCode(...new Uint8Array(signature)),
  );
  const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

  const response = await fetch(serviceAccount.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token as string;
}
