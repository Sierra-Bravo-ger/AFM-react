import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import WidgetCard from '../layout/WidgetCard';
import { normalizeErrorType, getErrorTypeColor, extractErrorType, ERROR_TYPE_COLORS } from '../../utils/ErrorTypeUtils';

/**
 * Widget zur Anzeige von Muster-Übereinstimmungen
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.patternData - Analysierte Muster-Daten
 * @param {boolean} props.loading - Ladezustand
 */
const PatternMatchWidget = ({ patternData, loading }) => {
  const [selectedPattern, setSelectedPattern] = useState(null);

  // Farben für das Diagramm - wir verwenden die zentrale Farbpalette
  const getChartColors = (patterns) => {
    if (!patterns || patterns.length === 0) return [];
    return patterns.map(pattern => {
      const normalizedType = normalizeErrorType(pattern.name);
      return getErrorTypeColor(normalizedType);
    });
  };

  // Daten für das Kreisdiagramm vorbereiten
  const chartData = useMemo(() => {
    if (!patternData || !patternData.patternCounts || patternData.patternCounts.length === 0) {
      return [];
    }

    // Maximal 7 Kategorien anzeigen, den Rest gruppieren
    const topPatterns = patternData.patternCounts.slice(0, 7);
    const otherPatterns = patternData.patternCounts.slice(7);
    
    const result = topPatterns.map(pattern => ({
      name: pattern.type,
      value: pattern.count,
      originalData: pattern
    }));

    // Wenn es mehr als 7 Kategorien gibt, den Rest als "Andere" zusammenfassen
    if (otherPatterns.length > 0) {
      const otherCount = otherPatterns.reduce((sum, pattern) => sum + pattern.count, 0);
      result.push({
        name: 'Andere',
        value: otherCount,
        originalData: { type: 'Andere', count: otherCount }
      });
    }

    return result;
  }, [patternData]);

  // Icon für das Widget
  const patternIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
  );

  // Analyse-Badge als Header-Action
  const analyseBadge = (
    <div className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-md text-xs font-medium flex items-center">
      <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mr-1"></div>
      Analyse
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full animate-pulse transition-colors duration-200">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto w-32"></div>
        </div>
      </div>
    );
  }

  const { patternCounts, totalPatterns } = patternData || { patternCounts: [], totalPatterns: 0 };
  
  // Benutzerdefinierter Tooltip für das Diagramm
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = Math.round((data.value / totalPatterns) * 100);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 shadow-md rounded text-xs">
          <p className="font-medium dark:text-gray-200">{data.name}</p>
          <p className="text-gray-600 dark:text-gray-400">Anzahl: {data.value}</p>
          <p className="text-purple-600 dark:text-purple-400">{percentage}% aller Muster</p>
        </div>
      );
    }
    return null;
  };

  // Benutzerdefinierte Legende für das Diagramm
  const CustomLegend = ({ payload }) => {
    if (!payload || payload.length === 0) return null;
    
    return (
      <ul className="flex flex-wrap justify-center text-xs gap-1 mt-2">
        {payload.map((entry, index) => (
          <li 
            key={`legend-${index}`}
            className="flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            onClick={() => setSelectedPattern(selectedPattern === entry.value ? null : entry.value)}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className="w-3 h-3 mr-1 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 dark:text-gray-300">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Widget-Inhalt
  const patternContent = (
    <div className="p-4">
      {patternCounts && patternCounts.length > 0 ? (
        <>
          <div className="mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 py-3 px-4 rounded-lg border border-purple-100 dark:border-purple-800 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-purple-800 dark:text-purple-300">Gesamt</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{totalPatterns}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">Muster-Typen</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{patternCounts.length}</p>
            </div>
          </div>
          
          {/* Kreisdiagramm und Zusammenfassung im Flex-Layout */}
          {chartData.length > 0 && (
            <div className="mb-4 mt-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Verteilung der Muster:</p>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="h-48 md:h-40 md:w-2/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => {
                          const normalizedType = normalizeErrorType(entry.name);
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getErrorTypeColor(normalizedType)} 
                              stroke={selectedPattern === entry.name ? '#000' : 'none'}
                              strokeWidth={selectedPattern === entry.name ? 2 : 0}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Top-Muster-Übersicht */}
                <div className="md:w-3/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {chartData.slice(0, 4).map((entry, index) => {
                      const percentage = Math.round((entry.value / totalPatterns) * 100);
                      return (
                        <div 
                          key={`top-${index}`}
                          className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-200 dark:border-gray-700"
                          onClick={() => setSelectedPattern(selectedPattern === entry.name ? null : entry.name)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getErrorTypeColor(normalizeErrorType(entry.name)) }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{entry.name}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{entry.value}</span>
                              <span className="text-xs font-medium" style={{ color: getErrorTypeColor(normalizeErrorType(entry.name)) }}>{percentage}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Legend content={<CustomLegend />} />
              </div>
            </div>
          )}
          
          <div className="space-y-2 mb-1 max-h-64 overflow-y-auto pr-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Details nach Muster-Typ:</p>
            {patternCounts.map((pattern) => {
              const percentage = Math.round((pattern.count / totalPatterns) * 100);
              const isSelected = selectedPattern === pattern.type;
              const normalizedType = normalizeErrorType(pattern.type);
              const color = getErrorTypeColor(normalizedType);
              
              return (
                <div 
                  key={pattern.type}
                  className={`border rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${
                    isSelected ? 'border-purple-200 shadow-md' : 'border-gray-200 hover:border-purple-100'
                  }`}
                >
                  <div 
                    className={`flex justify-between items-center p-2.5 cursor-pointer ${
                      isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedPattern(isSelected ? null : pattern.type)}
                    style={{ borderLeft: isSelected ? `3px solid ${color}` : '' }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-2.5 h-2.5 rounded-full mr-2"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="font-medium text-sm">{pattern.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {pattern.count}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage}%
                      </span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-4 w-4 text-gray-400 transition-transform ${isSelected ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {isSelected && pattern.examples && pattern.examples.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Beispiele:</p>
                      <ul className="space-y-1.5 text-xs">
                        {pattern.examples.map((example, index) => (
                          <li key={index} className="bg-gray-50 dark:bg-gray-700 p-1.5 rounded">
                            <div className="font-mono text-purple-700 dark:text-purple-400 truncate mb-0.5">{example.Datei}</div>
                            <div className="text-gray-600 dark:text-gray-400 truncate">{example.Text}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-center">Keine Muster-Daten verfügbar</p>
        </div>
      )}
    </div>
  );
  
  return (
    <WidgetCard
      title="Muster-Übereinstimmungen"
      icon={patternIcon}
      headerAction={analyseBadge}
      collapsible={true}
      defaultExpanded={true}
      className="h-full col-span-1 lg:col-span-2"
    >
      {patternContent}
    </WidgetCard>
  );
};

export default PatternMatchWidget;
