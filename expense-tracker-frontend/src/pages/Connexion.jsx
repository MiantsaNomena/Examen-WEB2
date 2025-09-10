import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <LogIn size={48} style={{ color: '#667eea', marginBottom: '1rem' }} />
          <h1 className="card-title">Connexion</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Connectez-vous à votre compte
          </p>
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
              <Mail size={16} style={{ marginRight: '0.5rem' }} />
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
              <Lock size={16} style={{ marginRight: '0.5rem' }} />
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
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={chargement}
          >
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            Pas encore de compte ?{' '}
            <Link 
              to="/inscription" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
