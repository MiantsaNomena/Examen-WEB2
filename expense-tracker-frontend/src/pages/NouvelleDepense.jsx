import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  FileText,
  Tag,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';
import { depenseService, categorieService } from '../services/api';

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

  useEffect(() => {
    chargerCategories();
  }, []);

  const chargerCategories = async () => {
    try {
      const data = await categorieService.obtenirCategories();
      setCategories(data.categories || []);
    } catch (error) {
      setErreur('Erreur lors du chargement des catégories');
      console.error(error);
    }
  };

  const gererChangement = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const gererFichier = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErreur('Format de fichier non supporté. Utilisez JPG, PNG ou PDF.');
        return;
      }
      
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErreur('Le fichier est trop volumineux. Taille maximale: 5MB.');
        return;
      }
      
      setSelectedFile(file);
      setErreur('');
      
      // Créer un aperçu pour les images
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
    // Reset file input
    const fileInput = document.getElementById('receipt-input');
    if (fileInput) fileInput.value = '';
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      // Créer FormData pour supporter les fichiers
      const formDataToSend = new FormData();
      
      formDataToSend.append('amount', parseFloat(formData.amount));
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('categoryId', parseInt(formData.categoryId));
      formDataToSend.append('type', formData.type);

      // Ajouter les dates de début/fin pour les dépenses récurrentes
      if (formData.type === 'recurring') {
        formDataToSend.append('startDate', formData.startDate);
        if (formData.endDate) {
          formDataToSend.append('endDate', formData.endDate);
        }
      }

      // Ajouter le fichier s'il existe
      if (selectedFile) {
        formDataToSend.append('receipt', selectedFile);
      }

      await depenseService.creerDepenseAvecFichier(formDataToSend);
      navigate('/depenses');
    } catch (error) {
      setErreur(
        error.response?.data?.message || 
        'Erreur lors de la création de la dépense'
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button 
          onClick={() => navigate('/depenses')}
          className="btn btn-outline"
          style={{ padding: '0.5rem' }}
        >
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
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Montant */}
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} style={{ marginRight: '0.5rem' }} />
                Montant *
              </label>
              <input
                type="number"
                name="amount"
                className="form-input"
                value={formData.amount}
                onChange={gererChangement}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Catégorie */}
            <div className="form-group">
              <label className="form-label">
                <Tag size={16} style={{ marginRight: '0.5rem' }} />
                Catégorie *
              </label>
              <select
                name="categoryId"
                className="form-select"
                value={formData.categoryId}
                onChange={gererChangement}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(categorie => (
                  <option key={categorie.id} value={categorie.id}>
                    {categorie.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="form-group">
              <label className="form-label">Type de dépense</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={gererChangement}
              >
                <option value="one-time">Ponctuelle</option>
                <option value="recurring">Récurrente</option>
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: '0.5rem' }} />
                {formData.type === 'recurring' ? 'Date de début *' : 'Date *'}
              </label>
              <input
                type="date"
                name={formData.type === 'recurring' ? 'startDate' : 'date'}
                className="form-input"
                value={formData.type === 'recurring' ? formData.startDate : formData.date}
                onChange={gererChangement}
                required
              />
            </div>

            {/* Date de fin (seulement pour récurrente) */}
            {formData.type === 'recurring' && (
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} style={{ marginRight: '0.5rem' }} />
                  Date de fin (optionnelle)
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={gererChangement}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={16} style={{ marginRight: '0.5rem' }} />
              Description
            </label>
            <textarea
              name="description"
              className="form-input"
              value={formData.description}
              onChange={gererChangement}
              placeholder="Description de la dépense (optionnelle)"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Upload de reçu */}
          <div className="form-group">
            <label className="form-label">
              <Upload size={16} style={{ marginRight: '0.5rem' }} />
              Reçu (optionnel)
            </label>
            <div style={{ 
              border: '2px dashed #e2e8f0',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: '#f8fafc'
            }}>
              {!selectedFile ? (
                <>
                  <input
                    id="receipt-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={gererFichier}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="receipt-input" 
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Upload size={32} style={{ color: '#64748b' }} />
                    <span style={{ color: '#64748b' }}>Cliquez pour sélectionner un fichier</span>
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      JPG, PNG, PDF - Max 5MB
                    </span>
                  </label>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {filePreview && (
                    <img 
                      src={filePreview} 
                      alt="Aperçu" 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover', 
                        borderRadius: '4px' 
                      }} 
                    />
                  )}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: '500' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={supprimerFichier}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      padding: '0.5rem'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Informations sur les dépenses récurrentes */}
          {formData.type === 'recurring' && (
            <div className="alert alert-warning">
              <AlertCircle size={20} />
              <div>
                <strong>Dépense récurrente :</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>Cette dépense sera comptabilisée chaque mois entre les dates spécifiées</li>
                  <li>Si aucune date de fin n'est spécifiée, elle sera considérée comme permanente</li>
                  <li>Elle apparaîtra automatiquement dans vos statistiques mensuelles</li>
                </ul>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            marginTop: '2rem'
          }}>
            <button
              type="button"
              onClick={() => navigate('/depenses')}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={chargement}
            >
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
