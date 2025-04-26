import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WidgetCard from '../layout/WidgetCard';

/**
 * Widget zur Anzeige der Dateianzahl
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.fileData - Daten zur Dateianzahl
 * @param {boolean} props.loading - Ladezustand
 */
const FileCountWidget = ({ fileData, loading }) => {
  // Bereite Daten für das Diagramm vor
  const chartData = useMemo(() => {
    if (!fileData || fileData.length === 0) return [];
    
    // Wir nehmen die letzten 10 Einträge für das Diagramm
    return fileData.slice(-10).map(entry => ({
      time: entry.Zeitpunkt.split(' ')[1], // Nur die Uhrzeit anzeigen
      anzahl: parseInt(entry.Anzahl) || 0
    }));
  }, [fileData]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full animate-pulse transition-colors duration-200">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Berechne Gesamtanzahl der Dateien und finde den letzten Eintrag
  const totalFiles = fileData?.reduce((sum, entry) => sum + (parseInt(entry.Anzahl) || 0), 0) || 0;
  const latestEntry = fileData?.length > 0 ? fileData[fileData.length - 1] : null;
  
  // Berechne Durchschnitt der Dateien pro Eintrag
  const averageFiles = fileData?.length > 0 
    ? (totalFiles / fileData.length).toFixed(1) 
    : 0;

  // Finde den Eintrag mit der höchsten Dateianzahl
  const maxEntry = fileData?.reduce(
    (max, entry) => (parseInt(entry.Anzahl) || 0) > (parseInt(max.Anzahl) || 0) ? entry : max, 
    { Anzahl: 0 }
  ) || { Anzahl: 0, Zeitpunkt: 'N/A' };

  // Benutzerdefinierter Tooltip für das Diagramm
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 shadow-md rounded text-xs">
          <p className="font-medium dark:text-gray-200">Zeit: {payload[0].payload.time}</p>
          <p className="text-indigo-600 dark:text-indigo-400">Dateien: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Icon für das Widget
  const fileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
    </svg>
  );

  // Monitoring-Badge als Header-Action
  const monitoringBadge = (
    <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md text-xs font-medium flex items-center">
      <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-1 animate-pulse"></div>
      Monitoring
    </div>
  );

  // Widget-Inhalt
  const fileCountContent = (
    <div className="p-4">
      {fileData && fileData.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-3 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">Gesamt</p>
                <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full"></div>
              </div>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mt-1">{totalFiles}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-3 rounded-lg shadow-sm border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-purple-800 dark:text-purple-300">Durchschnitt</p>
                <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-300 mt-1">{averageFiles}</p>
            </div>
          </div>
          
          {/* Diagramm */}
          {chartData.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Verlauf (letzte 10 Einträge):</p>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" className="dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#666', className: 'dark:fill-gray-300' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#666', className: 'dark:fill-gray-300' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="anzahl" 
                      stroke="#6366F1" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#6366F1', stroke: '#fff', strokeWidth: 1 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Letzter Eintrag:</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{latestEntry?.Zeitpunkt}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Letzte Anzahl:</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{latestEntry?.Anzahl}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Höchste Anzahl:</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{maxEntry.Anzahl} ({maxEntry.Zeitpunkt})</span>
            </div>
            <ul className="space-y-1">
              {latestEntry && latestEntry.Dateien && latestEntry.Dateien.length > 0 ? (
                <>
                  {latestEntry.Dateien.slice(0, 5).map((file, index) => (
                    <li key={index} className="font-mono text-indigo-700 truncate bg-indigo-50 px-2 py-1 rounded">{file}</li>
                  ))}
                  {latestEntry.Dateien.length > 5 && (
                    <li className="text-center text-gray-500 italic text-xs mt-1">
                      + {latestEntry.Dateien.length - 5} weitere Dateien
                    </li>
                  )}
                </>
              ) : (
                <li className="flex items-center justify-center py-3 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Keine Dateien vorhanden</span>
                </li>
              )}
            </ul>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="text-gray-500 text-center">Keine Datei-Daten verfügbar</p>
        </div>
      )}
    </div>
  );
};

export default FileCountWidget;
