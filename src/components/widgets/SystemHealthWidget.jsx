import React from 'react';
import WidgetCard from '../layout/WidgetCard';

/**
 * Widget zur Anzeige der Systemgesundheit
 * @param {Object} systemHealth - Systemgesundheits-Daten aus calculateSystemHealth
 */
const SystemHealthWidget = ({ systemHealth }) => {
  if (!systemHealth) {
    return (
      <WidgetCard title="System-Gesundheit">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 dark:text-gray-400">Keine Daten verfügbar</p>
        </div>
      </WidgetCard>
    );
  }

  // Farbe basierend auf Gesundheitsscore
  const getHealthColor = (score) => {
    if (score >= 90) return 'text-green-500 dark:text-green-400';
    if (score >= 75) return 'text-green-500 dark:text-green-400';
    if (score >= 50) return 'text-yellow-500 dark:text-yellow-400';
    if (score >= 25) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-500 dark:text-red-400';
  };

  // Farbe für Fehlertrend
  const getTrendColor = (trend) => {
    if (trend.includes('fallend')) return 'text-green-500 dark:text-green-400';
    if (trend.includes('steigend')) return 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <WidgetCard title="System-Gesundheit">
      <div className="flex flex-col items-center p-4">
        <div className={`text-5xl font-bold ${getHealthColor(systemHealth.score)}`}>
          {Math.round(systemHealth.score)}%
        </div>
        <div className="text-xl mt-2 font-medium text-gray-700 dark:text-gray-300">
          {systemHealth.status}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 w-full">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">Fehlerrate</div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-lg font-semibold dark:text-gray-200">Aktuell:</div>
              <span className="text-sm px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-red-700 dark:text-red-300">
                {(systemHealth.errorRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">Durchsatz/h</div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-lg font-semibold dark:text-gray-200">Aktuell:</div>
              <span className="text-sm px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300">
                {Math.round(systemHealth.throughput.hourlyAvg)}
              </span>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">Fehlertrend</div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-lg font-semibold dark:text-gray-200">Trend:</div>
              <span className={`text-sm px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 ${getTrendColor(systemHealth.errorTrend.description)}`}>
                {systemHealth.errorTrend.description}
              </span>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">Verarbeitet</div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-lg font-semibold dark:text-gray-200">Gesamt:</div>
              <span className="text-sm px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-green-700 dark:text-green-300">
                {systemHealth.throughput.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

export default SystemHealthWidget;
