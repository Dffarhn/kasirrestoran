import React from 'react';

const MenuGrid = ({ children }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {children}
    </div>
  );
};

export default MenuGrid;
