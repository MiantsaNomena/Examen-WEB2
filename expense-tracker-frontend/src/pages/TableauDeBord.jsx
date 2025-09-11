import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Calendar,
  PieChart
} from 'lucide-react';
import { statistiqueService } from '../services/api';
import './style/TableauDeBord.css';

const TableauDeBord = () => {
  const [resumeMensuel, setResumeMensuel] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().getMonth() + 1);
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(new Date().getFullYear());

  useEffect(() => {
    chargerResumeMensuel();
  }, [moisSelectionne, anneeSelectionnee]);

  const chargerResumeMensuel = async () => {
    try {
      setChargement(true);
      const data = await statistiqueService.obtenirResumeMensuel(anneeSelectionnee, moisSelectionne);
      setResumeMensuel(data);
    } catch (error) {
      setErreur('Erreur lors du chargement des statistiques');
      console.error(error);
    } finally {
      setChargement(false);
    }
  };

  const mois = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const solde = resumeMensuel ?
    (resumeMensuel.totalRevenus || 0) - (resumeMensuel.totalDepenses || 0) : 0;

  const budgetDepasse = solde < 0;

  if (chargement) {
    return (
      <div className="loading">
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>

        <div className="filters">
          <Calendar size={20} />
          <select
            className="form-select"
            value={moisSelectionne}
            onChange={(e) => setMoisSelectionne(parseInt(e.target.value))}
          >
            {mois.map((nom, index) => (
              <option key={index} value={index + 1}>
                {nom}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={anneeSelectionnee}
            onChange={(e) => setAnneeSelectionnee(parseInt(e.target.value))}
          >
            {[2023, 2024, 2025].map(annee => (
              <option key={annee} value={annee}>
                {annee}
              </option>
            ))}
          </select>
        </div>
      </div>

      {budgetDepasse && (
        <div className="alert alert-warning">
          <AlertTriangle size={20} />
          Attention ! Vous avez dépassé votre budget ce mois-ci de {Math.abs(solde).toFixed(2)} €
        </div>
      )}

      {erreur && (
        <div className="alert alert-error">
          {erreur}
        </div>
      )}

      <div className="cards-grid">
        {/* Revenus */}
        <div className="card">
          <div className="card-content">
            <div>
              <p className="card-label">Revenus totaux</p>
              <h2 className="card-value text-success">
                {resumeMensuel?.totalRevenus?.toFixed(2) || '0.00'} €
              </h2>
            </div>
            <TrendingUp size={32} className="icon-success" />
          </div>
        </div>

        {/* Dépenses */}
        <div className="card">
          <div className="card-content">
            <div>
              <p className="card-label">Dépenses totales</p>
              <h2 className="card-value text-danger">
                {resumeMensuel?.totalDepenses?.toFixed(2) || '0.00'} €
              </h2>
            </div>
            <TrendingDown size={32} className="icon-danger" />
          </div>
        </div>

        {/* Solde */}
        <div className="card">
          <div className="card-content">
            <div>
              <p className="card-label">Solde restant</p>
              <h2
                className="card-value"
                style={{ color: solde >= 0 ? '#28a745' : '#dc3545' }}
              >
                {solde.toFixed(2)} €
              </h2>
            </div>
            <DollarSign
              size={32}
              style={{ color: solde >= 0 ? '#28a745' : '#dc3545' }}
            />
          </div>
        </div>
      </div>

      {/* Répartition par catégories */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <PieChart size={20} style={{ marginRight: '0.5rem' }} />
            Répartition des dépenses par catégorie
          </h3>
        </div>

        {resumeMensuel?.categoriesDepenses?.length > 0 ? (
          <div>
            {resumeMensuel.categoriesDepenses.map((categorie, index) => {
              const pourcentage = resumeMensuel.totalDepenses > 0
                ? (categorie.total / resumeMensuel.totalDepenses * 100).toFixed(1)
                : 0;

              return (
                <div key={index} className="category-item">
                  <div className="category-header">
                    <span>{categorie.nom}</span>
                    <span className="category-value">
                      {categorie.total.toFixed(2)} € ({pourcentage}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pourcentage}%`,
                        background: `hsl(${index * 50}, 70%, 50%)`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-text">
            Aucune dépense enregistrée pour ce mois
          </p>
        )}
      </div>

      {/* Actions rapides */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Actions rapides</h3>
        </div>

        <div className="actions-grid">
          <a href="/depenses/nouvelle" className="btn btn-primary">
            Ajouter une dépense
          </a>
          <a href="/revenus/nouveau" className="btn btn-success">
            Ajouter un revenu
          </a>
          <a href="/categories" className="btn btn-outline">
            Gérer les catégories
          </a>
        </div>
      </div>
    </div>
  );
};

export default TableauDeBord;
