import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, BarChart, LineChart, SummaryCards } from '../components/Charts';
import { Calendar, TrendingUp } from 'lucide-react';
import './style/Statistiques.css';

const Statistiques = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [data, setData] = useState({
    summary: { totalExpenses: 0, totalIncomes: 0, totalTransactions: 0 },
    expensesByCategory: [],
    incomesByCategory: [],
    monthlyTrend: [],
    topCategories: [],
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const expensesResponse = await fetch(
        `http://localhost:3000/api/expenses?start=${dateRange.start}&end=${dateRange.end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const incomesResponse = await fetch(
        `http://localhost:3000/api/incomes?start=${dateRange.start}&end=${dateRange.end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (expensesResponse.ok && incomesResponse.ok) {
        const expensesData = await expensesResponse.json();
        const incomesData = await incomesResponse.json();
        processStatistics(expensesData.expenses || [], incomesData.incomes || []);
      } else {
        setError('Erreur lors du chargement des statistiques');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const processStatistics = (expenses, incomes) => {
    // … même logique qu’avant
  };

  return (
    <div className="statistiques-container">
      <div className="statistiques-header">
        <div>
          <h1>Statistiques</h1>
          <p className="text-gray-600 mt-2">Analysez vos habitudes financières</p>
        </div>

        {/* Filtre dates */}
        <div className="date-filter">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Période:</span>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <span className="text-gray-500">à</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <SummaryCards data={data.summary} />

          {/* Grille charts */}
          <div className="charts-grid">
            <PieChart data={data.expensesByCategory} title="Dépenses par Catégorie" />
            <BarChart data={data.topCategories} title="Top 5 des Catégories de Dépenses" color="#EF4444" />
            <PieChart data={data.incomesByCategory} title="Revenus par Source" />
            <LineChart data={data.monthlyTrend} title="Évolution Mensuelle (Balance)" />
          </div>

          {/* Conseils */}
          <div className="advice-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Analyses et Conseils
            </h3>
            {/* …contenu conseils */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistiques;
