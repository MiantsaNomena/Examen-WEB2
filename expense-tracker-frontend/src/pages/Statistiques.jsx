import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, BarChart, LineChart, SummaryCards } from '../components/Charts';
import { Calendar, TrendingUp, Filter } from 'lucide-react';

const Statistiques = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [data, setData] = useState({
    summary: {
      totalExpenses: 0,
      totalIncomes: 0,
      totalTransactions: 0
    },
    expensesByCategory: [],
    incomesByCategory: [],
    monthlyTrend: [],
    topCategories: []
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch expenses with filters
      const expensesResponse = await fetch(`http://localhost:3000/api/expenses?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch incomes with filters
      const incomesResponse = await fetch(`http://localhost:3000/api/incomes?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (expensesResponse.ok && incomesResponse.ok) {
        const expensesData = await expensesResponse.json();
        const incomesData = await incomesResponse.json();
        
        processStatistics(expensesData.expenses || [], incomesData.incomes || []);
      } else {
        setError('Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const processStatistics = (expenses, incomes) => {
    // Calculate summary
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const totalIncomes = incomes.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
    const totalTransactions = expenses.length + incomes.length;

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const categoryName = expense.category?.name || 'Sans catégorie';
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += parseFloat(expense.amount || 0);
      return acc;
    }, {});

    // Group incomes by category/source
    const incomesByCategory = incomes.reduce((acc, income) => {
      const source = income.description?.split(':')[0] || 'Autres revenus';
      if (!acc[source]) {
        acc[source] = 0;
      }
      acc[source] += parseFloat(income.amount || 0);
      return acc;
    }, {});

    // Create monthly trend data
    const monthlyData = {};
    [...expenses, ...incomes].forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('fr-FR', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { expenses: 0, incomes: 0 };
      }
      if (transaction.type === 'expense') {
        monthlyData[month].expenses += parseFloat(transaction.amount || 0);
      } else {
        monthlyData[month].incomes += parseFloat(transaction.amount || 0);
      }
    });

    const monthlyTrend = Object.entries(monthlyData).map(([month, values]) => ({
      name: month,
      value: values.incomes - values.expenses
    }));

    // Top spending categories
    const topCategories = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    setData({
      summary: {
        totalExpenses,
        totalIncomes,
        totalTransactions
      },
      expensesByCategory: Object.entries(expensesByCategory).map(([name, value]) => ({ name, value })),
      incomesByCategory: Object.entries(incomesByCategory).map(([name, value]) => ({ name, value })),
      monthlyTrend,
      topCategories
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Statistiques</h1>
          <p className="text-gray-600 mt-2">Analysez vos habitudes financières</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Période:</span>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">à</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {/* Summary Cards */}
          <SummaryCards data={data.summary} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expenses by Category */}
            <PieChart 
              data={data.expensesByCategory} 
              title="Dépenses par Catégorie" 
            />

            {/* Top Spending Categories */}
            <BarChart 
              data={data.topCategories} 
              title="Top 5 des Catégories de Dépenses"
              color="#EF4444"
            />

            {/* Incomes by Source */}
            <PieChart 
              data={data.incomesByCategory} 
              title="Revenus par Source" 
            />

            {/* Monthly Trend */}
            <LineChart 
              data={data.monthlyTrend} 
              title="Évolution Mensuelle (Balance)" 
            />
          </div>

          {/* Insights */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Analyses et Conseils
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Balance Analysis */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💰 Balance</h4>
                <p className="text-sm text-blue-700">
                  {data.summary.totalIncomes - data.summary.totalExpenses >= 0 ? 
                    "Félicitations ! Vous avez une balance positive ce mois-ci." :
                    "Attention ! Vos dépenses dépassent vos revenus ce mois-ci."
                  }
                </p>
              </div>

              {/* Top Category */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">📊 Catégorie Principale</h4>
                <p className="text-sm text-yellow-700">
                  {data.topCategories.length > 0 ? 
                    `Votre plus grosse dépense: ${data.topCategories[0].name} (${data.topCategories[0].value.toFixed(2)}€)` :
                    "Aucune donnée de dépense disponible"
                  }
                </p>
              </div>

              {/* Activity */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">📝 Activité</h4>
                <p className="text-sm text-green-700">
                  Vous avez enregistré {data.summary.totalTransactions} transaction{data.summary.totalTransactions > 1 ? 's' : ''} sur cette période.
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-800 mb-3">💡 Conseils pour améliorer vos finances</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Analysez vos plus grosses catégories de dépenses pour identifier les économies possibles</li>
              <li>• Fixez-vous un budget mensuel pour chaque catégorie importante</li>
              <li>• Surveillez l'évolution de votre balance mensuelle</li>
              <li>• Diversifiez vos sources de revenus si possible</li>
              <li>• Utilisez les filtres de date pour comparer différentes périodes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistiques;
