import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { estConnecte, chargement } = useAuth();

  if (chargement) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Chargement...</div>
      </div>
    );
  }

  return estConnecte ? children : <Navigate to="/connexion" replace />;
};

export default ProtectedRoute;
