import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import WidgetCard from '../layout/WidgetCard';

/**
 * Widget zur Anzeige von Status-Informationen
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.statusStats - Status-Statistiken
 * @param {boolean} props.loading - Ladezustand
 */
const StatusWidget = ({ statusStats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">System-Status</h2>
          <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
            Echtzeit
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const { latestStatus, startStatus, diffInput, diffArchiv, diffError } = statusStats || {};

  // Daten für das Diagramm vorbereiten
  const chartData = [
    {
      name: 'Input',
      wert: latestStatus?.Input || 0,
      farbe: '#3B82F6' // blue-500
    },
    {
      name: 'Archiv',
      wert: latestStatus?.Archiv || 0,
      farbe: '#10B981' // green-500
    },
    {
      name: 'Fehler-Dateien',
      wert: latestStatus?.Error || 0,
      farbe: '#EF4444' // red-500
    }
  ];
  
  // Funktion zum Formatieren der Differenz mit Vorzeichen
  const formatDiff = (diff) => {
    if (diff > 0) return `+${diff}`;
    return diff.toString();
  };

  // Benutzerdefinierter Tooltip für das Diagramm
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 shadow-md rounded text-xs">
          <p className="font-medium dark:text-gray-200">{payload[0].name}</p>
          <p className="font-semibold" style={{ color: payload[0].payload.farbe }}>{payload[0].value} Dateien</p>
        </div>
      );
    }
    return null;
  };

  // Status-Icon für den Widget-Header
  const statusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  // Echtzeit-Badge als Header-Action
  const liveStatusBadge = (
    <div className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md text-xs font-medium flex items-center">
      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-1 animate-pulse"></div>
      Echtzeit
    </div>
  );

  // Widget-Inhalt
  const statusContent = (
    <div className="p-4">
      {latestStatus ? (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Letzter Status:</p>
            <p className="text-sm font-medium dark:text-gray-300">{latestStatus.Zeitpunkt}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Input</p>
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-300 mt-1">{latestStatus.Input}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-lg shadow-sm border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-green-800 dark:text-green-300">Archiv</p>
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-300 mt-1">{latestStatus.Archiv}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-3 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-red-800 dark:text-red-300">Fehler-Dateien</p>
                <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-300 mt-1">{latestStatus.Error}</p>
            </div>
          </div>
          
          {/* Diagramm - Donut Chart */}
          <div className="mb-4 mt-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Aktuelle Verteilung:</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="wert"
                    nameKey="name"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                      // Nur Prozentsatz anzeigen, wenn er größer als 5% ist
                      if (percent < 0.05) return null;
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="#fff" 
                          textAnchor="middle" 
                          dominantBaseline="central"
                          className="text-xs font-medium"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.farbe} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry) => {
                      return <span className="text-xs font-medium dark:text-gray-300">{value}</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
            {/* Tabellenüberschriften */}
            <div className="grid grid-cols-4 gap-2 mb-1">
              <div className="col-span-1"></div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Start</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Aktuell</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Differenz</span>
              </div>
            </div>
            
            {/* Input-Zeile */}
            <div className="grid grid-cols-4 gap-2 py-1 border-b border-gray-100 dark:border-gray-800">
              <div className="col-span-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Input:</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{startStatus?.Input || 0}</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{latestStatus?.Input || 0}</span>
              </div>
              <div className="col-span-1 text-center">
                <span className={`text-xs font-semibold ${diffInput > 0 ? 'text-green-600 dark:text-green-400' : diffInput < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formatDiff(diffInput)}
                </span>
              </div>
            </div>
            
            {/* Archiv-Zeile */}
            <div className="grid grid-cols-4 gap-2 py-1 border-b border-gray-100 dark:border-gray-800">
              <div className="col-span-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Archiv:</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">{startStatus?.Archiv || 0}</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">{latestStatus?.Archiv || 0}</span>
              </div>
              <div className="col-span-1 text-center">
                <span className={`text-xs font-semibold ${diffArchiv > 0 ? 'text-green-600 dark:text-green-400' : diffArchiv < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formatDiff(diffArchiv)}
                </span>
              </div>
            </div>
            
            {/* Fehler-Zeile */}
            <div className="grid grid-cols-4 gap-2 py-1">
              <div className="col-span-1">
                <span className="text-xs font-medium text-red-600 dark:text-red-400">Fehler-Dateien</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">{startStatus?.Error || 0}</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">{latestStatus?.Error || 0}</span>
              </div>
              <div className="col-span-1 text-center">
                <span className={`text-xs font-semibold ${diffError > 0 ? 'text-red-600 dark:text-red-400' : diffError < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formatDiff(diffError)}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-center">Keine Status-Daten verfügbar</p>
        </div>
      )}
    </div>
  );

  return (
    <WidgetCard
      title="System-Status"
      icon={statusIcon}
      headerAction={liveStatusBadge}
      collapsible={true}
      defaultExpanded={true}
      className="h-full"
    >
      {statusContent}
    </WidgetCard>
  );
};

export default StatusWidget;
