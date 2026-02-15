import React, { useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useSession } from '../../context/SessionContext';

const SessionBootstrap = () => {
  const { restaurant, tableNumber } = useRestaurant();
  const { session, joinExistingSession, createNewSession } = useSession();

  useEffect(() => {
    const init = async () => {
      if (!restaurant?.id || !tableNumber) return;
      const tokenKey = `session_token_${restaurant.id}`;
      const token = localStorage.getItem(tokenKey);
      if (token || session) return; // sudah ada session untuk toko ini

      // Coba join session aktif berdasarkan toko + meja
      const joined = await joinExistingSession(restaurant.id, tableNumber);
      if (joined) return;

      // Jika tidak ada session aktif, buat session baru otomatis
      await createNewSession(restaurant.id, tableNumber, { name: null, phone: null });
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id, tableNumber]);

  return null;
};

export default SessionBootstrap;


