import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Calendar, FileText, Tag } from 'lucide-react';

const NouveauRevenu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    source: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/incomes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/revenus');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la création du revenu');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
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
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nouveau Revenu</h1>
          <p className="text-gray-600">Ajoutez un nouveau revenu à votre budget</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag size={16} className="inline mr-1" />
                Source du revenu
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-1" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Description détaillée du revenu (optionnel)"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">💡 Conseils</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Enregistrez vos revenus régulièrement pour un suivi précis</li>
            <li>• Utilisez des sources spécifiques pour mieux catégoriser vos revenus</li>
            <li>• La description peut inclure des détails comme le projet ou le client</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NouveauRevenu;
