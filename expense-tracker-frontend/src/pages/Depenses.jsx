import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Search, Filter,
  Calendar, DollarSign, Download, Eye
} from 'lucide-react';
import { depenseService, categorieService, recuService } from '../services/api';
import './style/Depenses.css';


const Depenses = () => {
  const [depenses, setDepenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [categorieFiltre, setCategorieFiltre] = useState('');
  const [typeFiltre, setTypeFiltre] = useState('');

  useEffect(() => { chargerDonnees(); }, []);

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
    } finally {
      setChargement(false);
    }
  };

  const voirRecu = async (id, fileName) => {
    try {
      const response = await recuService.obtenirRecu(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch {
      setErreur('Aucun reçu trouvé pour cette dépense');
    }
  };

  const telechargerRecu = async (id, fileName) => {
    try {
      await recuService.telechargerRecu(id, fileName);
    } catch {
      setErreur('Erreur lors du téléchargement du reçu');
    }
  };

  const supprimerDepense = async (id) => {
    if (!window.confirm('Êtes-vous sûr ?')) return;
    try {
      await depenseService.supprimerDepense(id);
      setDepenses(depenses.filter(d => d.id !== id));
    } catch {
      setErreur('Erreur lors de la suppression');
    }
  };

  const depensesFiltrees = depenses.filter(d => {
    const matchSearch = d.description?.toLowerCase().includes(recherche.toLowerCase()) ||
                        d.amount?.toString().includes(recherche);
    const matchCat = !categorieFiltre || d.categoryId?.toString() === categorieFiltre;
    const matchType = !typeFiltre || d.type === typeFiltre;
    return matchSearch && matchCat && matchType;
  });

  const obtenirNomCategorie = (id) => {
    const c = categories.find(cat => cat.id === id);
    return c ? c.name : 'Sans catégorie';
  };

  if (chargement) return <div className="loading">Chargement des dépenses...</div>;

  return (
    <div className="depenses-container">
      <div className="depenses-header">
        <h1>Mes Dépenses</h1>
        <Link to="/depenses/nouvelle" className="btn btn-primary">
          <Plus size={20} /> Nouvelle dépense
        </Link>
      </div>

      {erreur && <div className="alert alert-error">{erreur}</div>}

      {/* Filtres */}
      <div className="card">
        <div className="card-header">
          <h3><Filter size={20} /> Filtres</h3>
        </div>
        <div className="filters-grid">
          <div className="form-group">
            <label><Search size={16} /> Rechercher</label>
            <input type="text" placeholder="Description ou montant..."
                   value={recherche} onChange={e=>setRecherche(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Catégorie</label>
            <select value={categorieFiltre} onChange={e=>setCategorieFiltre(e.target.value)}>
              <option value="">Toutes</option>
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={typeFiltre} onChange={e=>setTypeFiltre(e.target.value)}>
              <option value="">Tous</option>
              <option value="one-time">Ponctuelle</option>
              <option value="recurring">Récurrente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {depensesFiltrees.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th><th>Description</th><th>Montant</th>
                  <th>Catégorie</th><th>Type</th><th>Reçu</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {depensesFiltrees.map(d=>(
                <tr key={d.id}>
                  <td><Calendar size={16}/> {new Date(d.date).toLocaleDateString('fr-FR')}</td>
                  <td>{d.description || 'Sans description'}</td>
                  <td className="amount"><DollarSign size={16}/> {d.amount?.toFixed(2)} €</td>
                  <td><span className="badge">{obtenirNomCategorie(d.categoryId)}</span></td>
                  <td>
                    <span className={`badge ${d.type==='recurring'?'recurring':'one-time'}`}>
                      {d.type==='recurring'?'Récurrente':'Ponctuelle'}
                    </span>
                  </td>
                  <td>
                    <button onClick={()=>voirRecu(d.id)} className="btn btn-outline"><Eye size={14}/></button>
                    <button onClick={()=>telechargerRecu(d.id)} className="btn btn-outline"><Download size={14}/></button>
                  </td>
                  <td>
                    <Link to={`/depenses/${d.id}/modifier`} className="btn btn-secondary"><Edit size={16}/></Link>
                    <button onClick={()=>supprimerDepense(d.id)} className="btn btn-danger"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        ):(
          <div className="empty-state">
            <DollarSign size={48}/>
            <h3>Aucune dépense trouvée</h3>
            <Link to="/depenses/nouvelle" className="btn btn-primary"><Plus size={20}/> Ajouter une dépense</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Depenses;
