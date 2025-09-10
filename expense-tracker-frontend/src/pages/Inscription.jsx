import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Inscription = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const { inscription, estConnecte } = useAuth();

  // Rediriger si déjà connecté
  if (estConnecte) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  const gererSoumission = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    setSucces('');

    // Validation des mots de passe
    if (motDePasse !== confirmationMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas');
      setChargement(false);
      return;
    }

    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères');
      setChargement(false);
      return;
    }

    try {
      await inscription(email, motDePasse);
      setSucces('Compte créé avec succès ! Redirection...');
      setTimeout(() => {
        // La redirection se fera automatiquement via le contexte d'auth
      }, 2000);
    } catch (error) {
      setErreur(
        error.response?.data?.message || 
        'Erreur lors de la création du compte. Veuillez réessayer.'
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
          <UserPlus size={48} style={{ color: '#667eea', marginBottom: '1rem' }} />
          <h1 className="card-title">Inscription</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Créez votre compte pour commencer
          </p>
        </div>

        {erreur && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            {erreur}
          </div>
        )}

        {succes && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            {succes}
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
              placeholder="Au moins 6 caractères"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ marginRight: '0.5rem' }} />
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              className="form-input"
              value={confirmationMotDePasse}
              onChange={(e) => setConfirmationMotDePasse(e.target.value)}
              placeholder="Répétez votre mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={chargement}
          >
            {chargement ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            Déjà un compte ?{' '}
            <Link 
              to="/connexion" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
