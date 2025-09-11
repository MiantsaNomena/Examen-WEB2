import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Eye
} from 'lucide-react';
import { depenseService, categorieService, recuService } from '../services/api';

const Depenses = () => {
  const [depenses, setDepenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [categorieFiltre, setCategorieFiltre] = useState('');
  const [typeFiltre, setTypeFiltre] = useState('');

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setChargement(true);
      const [depensesData, categoriesData] = await Promise.all([
        depenseService.obtenirDepenses(),
        categorieService.obtenirCategories()
      ]);
      setDepenses(depensesData.depenses || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      setErreur('Erreur lors du chargement des dépenses');
      console.error(error);
    } finally {
      setChargement(false);
    }
  };

  const voirRecu = async (expenseId, fileName) => {
    try {
      const response = await recuService.obtenirRecu(expenseId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du reçu:', error);
      setErreur('Aucun reçu trouvé pour cette dépense');
    }
  };

  const telechargerRecu = async (expenseId, fileName) => {
    try {
      await recuService.telechargerRecu(expenseId, fileName);
    } catch (error) {
      console.error('Erreur lors du téléchargement du reçu:', error);
      setErreur('Erreur lors du téléchargement du reçu');
    }
  };

  const supprimerDepense = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      return;
    }

    try {
      await depenseService.supprimerDepense(id);
      setDepenses(depenses.filter(d => d.id !== id));
    } catch (error) {
      setErreur('Erreur lors de la suppression');
      console.error(error);
    }
  };

  const depensesFiltrees = depenses.filter(depense => {
    const correspondRecherche = depense.description?.toLowerCase().includes(recherche.toLowerCase()) ||
                               depense.amount?.toString().includes(recherche);
    const correspondCategorie = !categorieFiltre || depense.categoryId?.toString() === categorieFiltre;
    const correspondType = !typeFiltre || depense.type === typeFiltre;
    
    return correspondRecherche && correspondCategorie && correspondType;
  });

  const obtenirNomCategorie = (categoryId) => {
    const categorie = categories.find(c => c.id === categoryId);
    return categorie ? categorie.name : 'Sans catégorie';
  };

  if (chargement) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Chargement des dépenses...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1>Mes Dépenses</h1>
        <Link to="/depenses/nouvelle" className="btn btn-primary">
          <Plus size={20} />
          Nouvelle dépense
        </Link>
      </div>

      {erreur && (
        <div className="alert alert-error">
          {erreur}
        </div>
      )}

      {/* Filtres */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Filter size={20} style={{ marginRight: '0.5rem' }} />
            Filtres
          </h3>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div className="form-group">
            <label className="form-label">
              <Search size={16} style={{ marginRight: '0.5rem' }} />
              Rechercher
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Description ou montant..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Catégorie</label>
            <select
              className="form-select"
              value={categorieFiltre}
              onChange={(e) => setCategorieFiltre(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {categories.map(categorie => (
                <option key={categorie.id} value={categorie.id}>
                  {categorie.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={typeFiltre}
              onChange={(e) => setTypeFiltre(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="one-time">Ponctuelle</option>
              <option value="recurring">Récurrente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des dépenses */}
      <div className="card">
        {depensesFiltrees.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Montant</th>
                  <th>Catégorie</th>
                  <th>Type</th>
                  <th>Reçu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {depensesFiltrees.map(depense => (
                  <tr key={depense.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} />
                        {new Date(depense.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td>{depense.description || 'Sans description'}</td>
                    <td>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        color: '#dc3545',
                        fontWeight: '500'
                      }}>
                        <DollarSign size={16} />
                        {depense.amount?.toFixed(2)} €
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#e9ecef',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {obtenirNomCategorie(depense.categoryId)}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: depense.type === 'recurring' ? '#fff3cd' : '#d4edda',
                        color: depense.type === 'recurring' ? '#856404' : '#155724',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {depense.type === 'recurring' ? 'Récurrente' : 'Ponctuelle'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => voirRecu(depense.id, `recu-${depense.id}`)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Voir le reçu"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => telechargerRecu(depense.id, `recu-${depense.id}.pdf`)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Télécharger le reçu"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link 
                          to={`/depenses/${depense.id}/modifier`}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem' }}
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => supprimerDepense(depense.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.5rem' }}
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
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <DollarSign size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
            <h3 style={{ color: '#666', marginBottom: '1rem' }}>
              Aucune dépense trouvée
            </h3>
            <p style={{ color: '#999', marginBottom: '2rem' }}>
              {depenses.length === 0 
                ? 'Commencez par ajouter votre première dépense'
                : 'Aucune dépense ne correspond à vos critères de recherche'
              }
            </p>
            <Link to="/depenses/nouvelle" className="btn btn-primary">
              <Plus size={20} />
              Ajouter une dépense
            </Link>
          </div>
        )}
      </div>

      {/* Résumé */}
      {depensesFiltrees.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Résumé</h3>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Total des dépenses</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#dc3545' }}>
                {depensesFiltrees.reduce((total, d) => total + (d.amount || 0), 0).toFixed(2)} €
              </p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Nombre de dépenses</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {depensesFiltrees.length}
              </p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Dépense moyenne</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {depensesFiltrees.length > 0 
                  ? (depensesFiltrees.reduce((total, d) => total + (d.amount || 0), 0) / depensesFiltrees.length).toFixed(2)
                  : '0.00'
                } €
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Depenses;
