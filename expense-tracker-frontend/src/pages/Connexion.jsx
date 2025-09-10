import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../pages/style/Connexion.css'; // 🔹 On importe le CSS

const Connexion = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const { connexion, estConnecte } = useAuth();

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
      <div className="connexion-card">
        <div className="connexion-header">
          <LogIn size={48} className="connexion-icon" />
          <h1>Connexion</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        {erreur && (
          <div className="alert-error">
            <AlertCircle size={20} />
            <span>{erreur}</span>
          </div>
        )}

        <form onSubmit={gererSoumission} className="connexion-form">
          <div className="form-group">
            <label>
              <Mail size={16} className="label-icon" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={16} className="label-icon" />
              Mot de passe
            </label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <button type="submit" disabled={chargement}>
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="inscription-link">
          <p>
            Pas encore de compte ?{' '}
            <Link to="/inscription">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
