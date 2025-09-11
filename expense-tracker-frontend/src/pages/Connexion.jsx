import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './style/Connexion.css';

const Connexion = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const { connexion, estConnecte } = useAuth();

  // Rediriger si déjà connecté
  if (estConnecte) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  const gererSoumission = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      await connexion(email, motDePasse);
    } catch (error) {
      setErreur(
        error.response?.data?.message ||
        'Erreur de connexion. Vérifiez vos identifiants.'
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="connexion-container">
      <div className="card">
        <div className="card-header">
          <LogIn size={48} className="icon-header" />
          <h1 className="card-title">Connexion</h1>
          <p className="card-subtitle">Connectez-vous à votre compte</p>
        </div>

        {erreur && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            {erreur}
          </div>
        )}

        <form onSubmit={gererSoumission}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} className="label-icon" />
              Email
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} className="label-icon" />
              Mot de passe
            </label>
            <input
              type="password"
              className="form-input"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={chargement}
          >
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="link-container">
          <p>
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="link-inscription">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
