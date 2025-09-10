import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import TableauDeBord from './pages/TableauDeBord';
import Depenses from './pages/Depenses';
import NouvelleDepense from './pages/NouvelleDepense';
import Revenus from './pages/Revenus';
import NouveauRevenu from './pages/NouveauRevenu';
import Categories from './pages/Categories';
import Statistiques from './pages/Statistiques';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          
          {/* Routes protégées */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Navigate to="/tableau-de-bord" replace />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/tableau-de-bord" element={
            <ProtectedRoute>
              <Layout>
                <TableauDeBord />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/depenses" element={
            <ProtectedRoute>
              <Layout>
                <Depenses />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/depenses/nouvelle" element={
            <ProtectedRoute>
              <Layout>
                <NouvelleDepense />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/revenus" element={
            <ProtectedRoute>
              <Layout>
                <Revenus />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/revenus/nouveau" element={
            <ProtectedRoute>
              <Layout>
                <NouveauRevenu />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/categories" element={
            <ProtectedRoute>
              <Layout>
                <Categories />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/statistiques" element={
            <ProtectedRoute>
              <Layout>
                <Statistiques />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/tableau-de-bord" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
