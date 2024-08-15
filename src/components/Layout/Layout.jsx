// Layout.js
import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

function Layout({ onSignOut }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Navbar  onSignOut={onSignOut} />
      <div className="main-wrapper">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="page-wrapper">
          <Outlet /> {/* Là où les composants des routes seront affichés */}
        </div>
      </div>
    </>
  );
}

export default Layout;
