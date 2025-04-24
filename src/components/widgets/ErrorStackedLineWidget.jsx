import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';
import WidgetCard from '../layout/WidgetCard';

/**
 * ErrorStackedLineWidget - Zeigt die Verteilung von Fehlertypen über Zeit als gestapelte Linien
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.patternData - Die Muster-Daten aus der CSV
 * @param {boolean} props.loading - Ladezustand
 */
const ErrorStackedLineWidget = ({ patternData, loading }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Normalisierungsfunktion für Mustertypen
  const normalizeMusterType = (type) => {
    // Bekannte Probleme mit Umlauten beheben
    const normalizedType = type
      .replace(/ZeitÃ¼berschreitung/g, 'Zeitüberschreitung')
      .replace(/Verbindung von peer/g, 'Verbindung von Peer');
    return normalizedType || 'Unbekannt';
  };

  // Verarbeite die Daten für das Diagramm
  const chartData = useMemo(() => {
    if (!patternData || patternData.length === 0) return [];
    
    // Gruppiere Daten nach Zeitstempel und Muster
    const groupedData = {};
    
    // Definiere Zeitintervalle für einen Tag (stündlich)
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(`${i}:00`);
    }
    
    // Initialisiere leere Datenpunkte für jede Stunde
    hours.forEach(hour => {
      groupedData[hour] = { timestamp: hour };
    });
    
    // Fülle die Daten aus den Mustern
    patternData.forEach(pattern => {
      const date = new Date(pattern.Zeitpunkt);
      const hour = `${date.getHours()}:00`;
      const patternType = normalizeMusterType(pattern.Muster || 'Unbekannt');
      
      if (!groupedData[hour][patternType]) {
        groupedData[hour][patternType] = 0;
      }
      
      groupedData[hour][patternType] += 1;
    });
    
    // Konvertiere in Array und sortiere nach Zeitstempel
    return Object.entries(groupedData)
      .map(([hour, data]) => ({
        ...data,
        hour: parseInt(hour.split(':')[0])
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [patternData]);

  // Extrahiere alle eindeutigen Mustertypen für die Linien
  const patternTypes = useMemo(() => {
    if (!patternData || patternData.length === 0) return [];
    
    const types = new Set();
    patternData.forEach(pattern => {
      const normalizedType = normalizeMusterType(pattern.Muster || 'Unbekannt');
      types.add(normalizedType);
    });
    
    return Array.from(types);
  }, [patternData]);
  
  // Farbpalette für die verschiedenen Mustertypen - hellere Farben für weißes Design
  const colors = {
    'Zeitüberschreitung': '#FF6B81',
    'Timeout': '#36A2EB',
    'multiple Rows': '#FFCD56',
    'nicht definiert': '#4BC0C0',
    'lock conflict': '#9966FF',
    'deadlock': '#FF9F40',
    'Verbindung von Peer': '#FF6384',
    'Unbekannt': '#C9CBCF'
  };
  
  // Zeige Lade-Skeleton wenn Daten geladen werden
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse transition-colors duration-200">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  // Icon für das Widget
  const chartIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );

  // Legende als Header-Content
  const legendContent = (
    <div className="flex flex-wrap gap-3 text-xs">
      {patternTypes.map((type) => (
        <div key={type} className="flex items-center">
          <div 
            className="w-4 h-4 mr-1 rounded" 
            style={{ backgroundColor: colors[type] || '#C9CBCF' }}
          ></div>
          <span className="text-gray-700 dark:text-gray-300">{type}</span>
        </div>
      ))}
    </div>
  );

  // Chart-Inhalt
  const chartContent = (
    <div className="h-96">
      {chartData.length > 0 ? (
        <div className="h-full p-4 bg-white dark:bg-gray-800">
          {/* Legende innerhalb des Hauptinhalts */}
          <div className="mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded transition-colors duration-200">
            <div className="flex flex-wrap gap-3 text-xs">
              {patternTypes.map((type) => (
                <div key={type} className="flex items-center">
                  <div 
                    className="w-4 h-4 mr-1 rounded" 
                    style={{ backgroundColor: colors[type] || '#C9CBCF' }}
                  ></div>
                  <span className="text-gray-700 dark:text-gray-300">{type}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full h-full bg-white dark:bg-gray-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                style={{ backgroundColor: 'inherit' }}
              >
                <defs>
                  {patternTypes.map((type, index) => (
                    <linearGradient key={`gradient-${type}`} id={`colorGradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="white" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="white" stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fill: '#666', className: 'dark:fill-gray-300' }}
                  tickFormatter={(hour) => `${hour}:00`}
                  label={{ value: 'Zeitraum: 1 Tag', position: 'insideBottom', offset: -10, fill: '#666', className: 'dark:fill-gray-300' }}
                />
                <YAxis 
                  tick={{ fill: '#666', className: 'dark:fill-gray-300' }}
                  label={{ value: 'Anzahl der Fehler', angle: -90, position: 'insideLeft', fill: '#666', className: 'dark:fill-gray-300' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid var(--tooltip-border, #e0e0e0)', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'var(--tooltip-text, #333)' }}
                  labelStyle={{ color: 'var(--tooltip-label, #333)' }}
                  formatter={(value, name) => [value || 0, name]}
                  labelFormatter={(hour) => `${hour}:00 Uhr`}
                />
                {patternTypes.map((type) => (
                  <Area 
                    key={type}
                    type="monotone"
                    dataKey={type}
                    stackId="1"
                    stroke={colors[type] || '#C9CBCF'}
                    strokeWidth={2}
                    fillOpacity={0.1}
                    fill={colors[type] || '#C9CBCF'}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    dot={{ r: 3, fill: colors[type] || '#C9CBCF', stroke: '#fff', strokeWidth: 1 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
          Keine Daten verfügbar
        </div>
      )}
    </div>
  );

  return (
    <WidgetCard
      title="Fehlertypen-Verlauf"
      icon={chartIcon}
      collapsible={true}
      defaultExpanded={true}
    >
      {chartContent}
    </WidgetCard>
  );
};

export default ErrorStackedLineWidget;
