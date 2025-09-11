import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Calendar, DollarSign, Search, Filter } from 'lucide-react';

const Revenus = () => {
  const { user } = useAuth();
  const [revenus, setRevenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRevenu, setEditingRevenu] = useState(null);
  const [filters, setFilters] = useState({
    start: '',
    end: '',
    search: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    source: '',
    description: ''
  });

  useEffect(() => {
    fetchRevenus();
  }, [filters]);

  const fetchRevenus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.start) queryParams.append('start', filters.start);
      if (filters.end) queryParams.append('end', filters.end);
      
      const response = await fetch(`http://localhost:3000/api/incomes?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        let filteredRevenus = data.incomes || [];
        
        // Apply search filter on frontend
        if (filters.search) {
          filteredRevenus = filteredRevenus.filter(revenu => 
            revenu.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
            revenu.amount?.toString().includes(filters.search)
          );
        }
        
        setRevenus(filteredRevenus);
      } else {
        setError('Erreur lors du chargement des revenus');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingRevenu 
        ? `http://localhost:3000/api/incomes/${editingRevenu.id}`
        : 'http://localhost:3000/api/incomes';
      
      const method = editingRevenu ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchRevenus();
        setShowForm(false);
        setEditingRevenu(null);
        setFormData({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          source: '',
          description: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const handleEdit = (revenu) => {
    setEditingRevenu(revenu);
    setFormData({
      amount: revenu.amount.toString(),
      date: new Date(revenu.date).toISOString().split('T')[0],
      source: revenu.description?.split(':')[0] || '',
      description: revenu.description?.includes(':') ? revenu.description.split(':')[1].trim() : revenu.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/incomes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchRevenus();
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const totalRevenus = revenus.reduce((sum, revenu) => sum + parseFloat(revenu.amount || 0), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Revenus</h1>
          <p className="text-gray-600 mt-2">
            Total des revenus: <span className="font-semibold text-green-600">{totalRevenus.toFixed(2)} €</span>
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingRevenu(null);
            setFormData({
              amount: '',
              date: new Date().toISOString().split('T')[0],
              source: '',
              description: ''
            });
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nouveau Revenu
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search size={16} className="inline mr-1" />
              Rechercher
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Rechercher par description ou montant..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={filters.start}
              onChange={(e) => setFilters({...filters, start: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={filters.end}
              onChange={(e) => setFilters({...filters, end: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setFilters({ start: '', end: '', search: '' })}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingRevenu ? 'Modifier le revenu' : 'Nouveau revenu'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (€) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                placeholder="ex: Salaire, Freelance, Investissement..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description du revenu..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                {editingRevenu ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRevenu(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des revenus */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Liste des revenus</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : revenus.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucun revenu trouvé</p>
            <p className="text-sm">Commencez par ajouter votre premier revenu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Montant</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {revenus.map((revenu) => (
                  <tr key={revenu.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {new Date(revenu.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      +{parseFloat(revenu.amount).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {revenu.description || 'Aucune description'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(revenu)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(revenu.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Revenus;
