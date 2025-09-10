import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const utilisateurStocke = authService.obtenirUtilisateur();
    if (utilisateurStocke && authService.estConnecte()) {
      setUtilisateur(utilisateurStocke);
    }
    setChargement(false);
  }, []);

  const connexion = async (email, password) => {
    try {
      const response = await authService.connexion(email, password);
      setUtilisateur(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const inscription = async (email, password) => {
    try {
      const response = await authService.inscription(email, password);
      setUtilisateur(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const deconnexion = () => {
    authService.deconnexion();
    setUtilisateur(null);
  };

  const valeur = {
    utilisateur,
    chargement,
    connexion,
    inscription,
    deconnexion,
    estConnecte: !!utilisateur
  };

  return (
    <AuthContext.Provider value={valeur}>
      {children}
    </AuthContext.Provider>
  );
};
