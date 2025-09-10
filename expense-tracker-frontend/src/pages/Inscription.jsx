import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './style/Inscription.css'; // <-- import du CSS

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
    <div className="inscription-container">
      <div className="card">
        <div className="card-header">
          <UserPlus size={48} className="icon-header" />
          <h1 className="card-title">Inscription</h1>
          <p className="card-subtitle">Créez votre compte pour commencer</p>
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
              placeholder="Au moins 6 caractères"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} className="label-icon" />
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
            disabled={chargement}
          >
            {chargement ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="link-container">
          <p>
            Déjà un compte ?{' '}
            <Link to="/connexion" className="link-inscription">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
