import React from 'react';

// Simple Pie Chart Component
export const PieChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Aucune donnée à afficher</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              
              const result = (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
              
              cumulativePercentage += percentage;
              return result;
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{total.toFixed(0)}€</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
        
        <div className="ml-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-gray-700">{item.name}</span>
              <span className="text-sm font-medium text-gray-900">
                {item.value.toFixed(2)}€ ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Bar Chart Component
export const BarChart = ({ data, title, color = '#3B82F6' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Aucune donnée à afficher</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 truncate">
                {item.name}
              </div>
              <div className="flex-1 relative">
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      {item.value.toFixed(0)}€
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Line Chart Component (simplified)
export const LineChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Aucune donnée à afficher</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="relative h-64">
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={`${y}%`}
              x2="100%"
              y2={`${y}%`}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#3B82F6"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600">
          {data.map((item, index) => (
            <span key={index} className="transform -translate-x-1/2">
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Summary Cards Component
export const SummaryCards = ({ data }) => {
  const cards = [
    {
      title: 'Total Dépenses',
      value: data.totalExpenses || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '💸'
    },
    {
      title: 'Total Revenus',
      value: data.totalIncomes || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '💰'
    },
    {
      title: 'Balance',
      value: (data.totalIncomes || 0) - (data.totalExpenses || 0),
      color: (data.totalIncomes || 0) - (data.totalExpenses || 0) >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: (data.totalIncomes || 0) - (data.totalExpenses || 0) >= 0 ? 'bg-green-50' : 'bg-red-50',
      icon: '📊'
    },
    {
      title: 'Transactions',
      value: data.totalTransactions || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '📝'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} p-6 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>
                {typeof card.value === 'number' ? 
                  (card.title === 'Transactions' ? card.value : `${card.value.toFixed(2)}€`) 
                  : card.value
                }
              </p>
            </div>
            <div className="text-2xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
