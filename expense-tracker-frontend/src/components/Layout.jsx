import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOuvert, setSidebarOuvert] = useState(false);

  const basculerSidebar = () => {
    setSidebarOuvert(!sidebarOuvert);
  };

  return (
    <div className="app">
      <Sidebar ouvert={sidebarOuvert} basculer={basculerSidebar} />
      
      <main className={`main-content ${sidebarOuvert ? 'expanded' : ''}`}>
        {/* En-tête mobile */}
        <div className="mobile-header">
          <h1>Gestionnaire de Dépenses</h1>
          <button 
            onClick={basculerSidebar}
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
          >
            {sidebarOuvert ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {children}
      </main>
    </div>
  );
};

export default Layout;
