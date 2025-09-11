import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, DollarSign, Calendar, FileText,
  Tag, AlertCircle, Upload, X
} from 'lucide-react';
import { depenseService, categorieService } from '../services/api';
import './style/NouvelleDepense.css'; // ← nouveau CSS

const NouvelleDepense = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    type: 'one-time',
    startDate: '',
    endDate: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => { chargerCategories(); }, []);

  const chargerCategories = async () => {
    try {
      const data = await categorieService.obtenirCategories();
      setCategories(data.categories || []);
    } catch {
      setErreur('Erreur lors du chargement des catégories');
    }
  };

  const gererChangement = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const gererFichier = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErreur('Format non supporté. Utilisez JPG, PNG ou PDF.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErreur('Fichier trop volumineux (max 5MB).');
        return;
      }
      setSelectedFile(file);
      setErreur('');
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const supprimerFichier = () => {
    setSelectedFile(null);
    setFilePreview(null);
    const fileInput = document.getElementById('receipt-input');
    if (fileInput) fileInput.value = '';
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', parseFloat(formData.amount));
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('categoryId', parseInt(formData.categoryId));
      formDataToSend.append('type', formData.type);
      if (formData.type === 'recurring') {
        formDataToSend.append('startDate', formData.startDate);
        if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
      }
      if (selectedFile) formDataToSend.append('receipt', selectedFile);

      await depenseService.creerDepenseAvecFichier(formDataToSend);
      navigate('/depenses');
    } catch (error) {
      setErreur(error.response?.data?.message || 'Erreur lors de la création de la dépense');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="nd-container">
      <div className="nd-header">
        <button onClick={() => navigate('/depenses')} className="btn btn-outline">
          <ArrowLeft size={20} />
        </button>
        <h1>Nouvelle Dépense</h1>
      </div>

      {erreur && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {erreur}
        </div>
      )}

      <div className="card">
        <form onSubmit={gererSoumission}>
          <div className="grid-form">
            <div className="form-group">
              <label><DollarSign size={16} /> Montant *</label>
              <input type="number" name="amount" value={formData.amount} onChange={gererChangement} placeholder="0.00" step="0.01" min="0" required />
            </div>

            <div className="form-group">
              <label><Tag size={16} /> Catégorie *</label>
              <select name="categoryId" value={formData.categoryId} onChange={gererChangement} required>
                <option value="">Sélectionner une catégorie</option>
                {categories.map(categorie => (
                  <option key={categorie.id} value={categorie.id}>{categorie.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Type de dépense</label>
              <select name="type" value={formData.type} onChange={gererChangement}>
                <option value="one-time">Ponctuelle</option>
                <option value="recurring">Récurrente</option>
              </select>
            </div>

            <div className="form-group">
              <label><Calendar size={16} /> {formData.type === 'recurring' ? 'Date de début *' : 'Date *'}</label>
              <input type="date" name={formData.type === 'recurring' ? 'startDate' : 'date'} value={formData.type === 'recurring' ? formData.startDate : formData.date} onChange={gererChangement} required />
            </div>

            {formData.type === 'recurring' && (
              <div className="form-group">
                <label><Calendar size={16} /> Date de fin (optionnelle)</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={gererChangement} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label><FileText size={16} /> Description</label>
            <textarea name="description" value={formData.description} onChange={gererChangement} rows={3} placeholder="Description (optionnelle)" />
          </div>

          <div className="form-group">
            <label><Upload size={16} /> Reçu (optionnel)</label>
            <div className="upload-box">
              {!selectedFile ? (
                <>
                  <input id="receipt-input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={gererFichier} style={{ display: 'none' }} />
                  <label htmlFor="receipt-input" className="upload-label">
                    <Upload size={32} />
                    <span>Cliquez pour sélectionner un fichier</span>
                    <small>JPG, PNG, PDF - Max 5MB</small>
                  </label>
                </>
              ) : (
                <div className="file-preview">
                  {filePreview && <img src={filePreview} alt="Aperçu" />}
                  <div className="file-info">
                    <div>{selectedFile.name}</div>
                    <small>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                  <button type="button" onClick={supprimerFichier} className="remove-btn">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {formData.type === 'recurring' && (
            <div className="alert alert-warning">
              <AlertCircle size={20} />
              <div>
                <strong>Dépense récurrente :</strong>
                <ul>
                  <li>Cette dépense sera comptabilisée chaque mois entre les dates spécifiées</li>
                  <li>Si aucune date de fin n'est spécifiée, elle sera considérée comme permanente</li>
                  <li>Elle apparaîtra automatiquement dans vos statistiques mensuelles</li>
                </ul>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/depenses')} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={chargement}>
              <Save size={20} />
              {chargement ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NouvelleDepense;
