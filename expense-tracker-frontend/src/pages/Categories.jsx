import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, FolderOpen, Tag, Search } from 'lucide-react';
import './style/Categories.css';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        setError('Erreur lors du chargement des catégories');
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
      const url = editingCategory 
        ? `http://localhost:3000/api/categories/${editingCategory.id}`
        : 'http://localhost:3000/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchCategories();
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: '', type: 'expense' });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, type: category.type });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchCategories();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');
  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income');

  return (
    <div className="categories-container">
      <div className="categories-header">
        <div>
          <h1 className="title">Gestion des Catégories</h1>
          <p className="subtitle">Organisez vos dépenses et revenus par catégories</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormData({ name: '', type: 'expense' });
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Nouvelle Catégorie
        </button>
      </div>

      <div className="search-box">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une catégorie..."
        />
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>{editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom de la catégorie *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="ex: Alimentation, Transport..."
              />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="expense">Dépense</option>
                <option value="income">Revenu</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingCategory ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="categories-grid">
          <div className="card">
            <h2 className="card-title">
              <Tag size={20} /> Catégories de Dépenses ({expenseCategories.length})
            </h2>
            {expenseCategories.length === 0 ? (
              <div className="empty">
                <FolderOpen size={48} />
                <p>Aucune catégorie de dépense</p>
              </div>
            ) : (
              expenseCategories.map((category) => (
                <div key={category.id} className="category-row">
                  <span>{category.name}</span>
                  <div className="actions">
                    <button onClick={() => handleEdit(category)}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(category.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2 className="card-title">
              <Tag size={20} /> Catégories de Revenus ({incomeCategories.length})
            </h2>
            {incomeCategories.length === 0 ? (
              <div className="empty">
                <FolderOpen size={48} />
                <p>Aucune catégorie de revenu</p>
              </div>
            ) : (
              incomeCategories.map((category) => (
                <div key={category.id} className="category-row">
                  <span>{category.name}</span>
                  <div className="actions">
                    <button onClick={() => handleEdit(category)}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(category.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
