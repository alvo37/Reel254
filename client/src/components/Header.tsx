import React from 'react';

// Minimal Header component with gradient background and brand title only
const Header: React.FC = () => (
  <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 shadow-lg">
    <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
      Reel254
    </h1>
  </header>
);

export default Header;
