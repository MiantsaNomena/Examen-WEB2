import React, { useState } from 'react'; // pour gerer le state
import { useNavigate } from 'react-router-dom'; // navigation entre les pages 
import { useAuth } from '../context/AuthContext'; // recuperer l utilisateur connecté 
import { DollarSign, Calendar, FileText, Tag } from 'lucide-react'; // icones 
import './style/NouveauRevenu.css';


const NouveauRevenu = () => {
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // stocke un message d erreur 

  const [formData, setFormData] = useState({
    amount: '', // montant
    date: new Date().toISOString().split('T')[0],
    source: '', // source du revenu
    description: '' // description optionelle 
  });

  // fonction qui gere le changement d un input 
  const handleSubmit = async (e) => {
    e.preventDefault(); // empeche le rechargement de la page
    setLoading(true);// Avtive le spiner
    setError(''); // reset des erreurs

    try {
      const token = localStorage.getItem('token'); // Recupere le token JWT
      const response = await fetch('http://localhost:3000/api/incomes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // authentification
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData) // envoie les données du formulaire
      });

      if (response.ok) {
        navigate('/revenus'); // Redirection si succes 
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la création du revenu');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur'); // Erreur reseau
    } finally {
      setLoading(false); // Stop spinnerz
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="nr-container">
      <div className="nr-wrapper">
        <div className="nr-header">
          <h1>Nouveau Revenu</h1>
          <p>Ajoutez un nouveau revenu à votre budget</p>
        </div>

        {error && (
          <div className="nr-error">{error}</div>
        )}

        <div className="nr-card">
          <form onSubmit={handleSubmit} className="nr-form">
            <div className="nr-group">
              <label>
                <DollarSign size={16} className="icon" />
                Montant (€) *
              </label>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>

            <div className="nr-group">
              <label>
                <Calendar size={16} className="icon" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nr-group">
              <label>
                <Tag size={16} className="icon" />
                Source du revenu
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
              >
                <option value="">Sélectionner une source</option>
                <option value="Salaire">Salaire</option>
                <option value="Freelance">Freelance</option>
                <option value="Investissement">Investissement</option>
                <option value="Bonus">Bonus</option>
                <option value="Vente">Vente</option>
                <option value="Remboursement">Remboursement</option>
                <option value="Cadeau">Cadeau</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="nr-group">
              <label>
                <FileText size={16} className="icon" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Description détaillée du revenu (optionnel)"
              />
            </div>

            <div className="nr-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <DollarSign size={16} />
                    Ajouter le revenu
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/revenus')}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        <div className="nr-tips">
          <h3>💡 Conseils</h3>
          <ul>
            <li>Enregistrez vos revenus régulièrement pour un suivi précis</li>
            <li>Utilisez des sources spécifiques pour mieux catégoriser vos revenus</li>
            <li>La description peut inclure des détails comme le projet ou le client</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NouveauRevenu;
