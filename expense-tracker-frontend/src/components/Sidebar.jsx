import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  FolderOpen, 
  User, 
  LogOut,
  Wallet,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ ouvert, basculer }) => {
  const location = useLocation();
  const { deconnexion, utilisateur } = useAuth();

  const elementsMenu = [
    { 
      nom: 'Tableau de bord', 
      chemin: '/tableau-de-bord', 
      icone: Home 
    },
    { 
      nom: 'Dépenses', 
      chemin: '/depenses', 
      icone: CreditCard 
    },
    { 
      nom: 'Revenus', 
      chemin: '/revenus', 
      icone: TrendingUp 
    },
    { 
      nom: 'Catégories', 
      chemin: '/categories', 
      icone: FolderOpen 
    },
    { 
      nom: 'Statistiques', 
      chemin: '/statistiques', 
      icone: BarChart3 
    },
    { 
      nom: 'Profil', 
      chemin: '/profil', 
      icone: User 
    }
  ];

  const gererDeconnexion = () => {
    deconnexion();
  };

  return (
    <aside className={`sidebar ${ouvert ? 'open' : ''}`}>
      <div className="nav-header">
        <Wallet size={24} />
        <h1>Gestionnaire de Dépenses</h1>
      </div>

      <nav>
        <ul className="nav-menu">
          {elementsMenu.map((element) => {
            const Icone = element.icone;
            const estActif = location.pathname === element.chemin;
            
            return (
              <li key={element.chemin} className="nav-item">
                <Link 
                  to={element.chemin} 
                  className={`nav-link ${estActif ? 'active' : ''}`}
                  onClick={() => window.innerWidth <= 768 && basculer()}
                >
                  <Icone size={20} />
                  <span>{element.nom}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        {utilisateur && (
          <div style={{ 
            padding: '1rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '1rem'
          }}>
            <p style={{ 
              fontSize: '0.9rem', 
              opacity: 0.8,
              marginBottom: '0.5rem'
            }}>
              Connecté en tant que
            </p>
            <p style={{ 
              fontSize: '0.95rem', 
              fontWeight: '500'
            }}>
              {utilisateur.name}
            </p>
          </div>
        )}
        
        <button 
          onClick={gererDeconnexion}
          className="nav-link"
          style={{ 
            width: '100%', 
            background: 'none', 
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
