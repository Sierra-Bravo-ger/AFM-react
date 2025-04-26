import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import WidgetCard from '../layout/WidgetCard';
import { normalizeErrorType, getErrorTypeColor, extractErrorType, ERROR_TYPE_COLORS } from '../../utils/ErrorTypeUtils';

/**
 * ErrorStackedBarWidget - Zeigt die Verteilung von Fehlertypen über Zeit als gestapelte Balken
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.patternData - Die Muster-Daten aus der CSV
 * @param {boolean} props.loading - Ladezustand
 */
const ErrorStackedBarWidget = ({ patternData, loading }) => {
  // Zeitansicht: 'day' oder 'hour'
  const [viewMode, setViewMode] = useState('auto');
  // State für ausgeblendete Fehlertypen
  const [hiddenTypes, setHiddenTypes] = useState([]);
  
  // Wir verwenden jetzt die zentrale Utility-Funktion für die Normalisierung von Fehlertypen

  // Verarbeite die Daten für das Diagramm
  const chartData = useMemo(() => {
    if (!patternData || patternData.length === 0) return [];
    
    // Bestimme den Zeitraum der Daten
    const dates = patternData.map(pattern => new Date(pattern.Zeitpunkt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Berechne die Anzahl der Tage im Zeitraum
    const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    
    // Automatische Auswahl des Anzeigemodus basierend auf dem Zeitraum
    const autoMode = daysDiff > 2 ? 'day' : 'hour';
    const effectiveViewMode = viewMode === 'auto' ? autoMode : viewMode;
    
    // Gruppiere Daten nach Zeitstempel und Muster
    const groupedData = {};
    
    if (effectiveViewMode === 'hour') {
      // Stündliche Gruppierung
      for (let i = 0; i < 24; i++) {
        const hourKey = `${i}:00`;
        groupedData[hourKey] = { 
          timestamp: hourKey,
          hour: i,
          display: `${i}:00` 
        };
      }
      
      patternData.forEach(pattern => {
        const date = new Date(pattern.Zeitpunkt);
        const hourKey = `${date.getHours()}:00`;
        const patternType = normalizeErrorType(pattern.Muster || 'Unbekannt');
        
        if (!groupedData[hourKey][patternType]) {
          groupedData[hourKey][patternType] = 0;
        }
        
        groupedData[hourKey][patternType] += 1;
      });
      
      // Konvertiere in Array und sortiere nach Stunde
      return Object.values(groupedData)
        .sort((a, b) => a.hour - b.hour);
    } else {
      // Tägliche Gruppierung
      const dateMap = {};
      
      // Initialisiere für jeden Tag im Zeitraum
      for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        const displayDate = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        
        dateMap[dateKey] = {
          timestamp: dateKey,
          day: d.getDate(),
          month: d.getMonth(),
          display: displayDate
        };
      }
      
      patternData.forEach(pattern => {
        const date = new Date(pattern.Zeitpunkt);
        const dateKey = date.toISOString().split('T')[0];
        const patternType = normalizeErrorType(pattern.Muster || 'Unbekannt');
        
        if (!dateMap[dateKey]) return; // Überspringe, falls außerhalb des Zeitraums
        
        if (!dateMap[dateKey][patternType]) {
          dateMap[dateKey][patternType] = 0;
        }
        
        dateMap[dateKey][patternType] += 1;
      });
      
      // Konvertiere in Array und sortiere nach Datum
      return Object.values(dateMap)
        .sort((a, b) => {
          if (a.month !== b.month) return a.month - b.month;
          return a.day - b.day;
        });
    }
  }, [patternData, viewMode]);

  // Extrahiere alle eindeutigen Mustertypen für die Balken
  const patternTypes = useMemo(() => {
    if (!patternData || patternData.length === 0) return [];
    
    const types = new Set();
    patternData.forEach(pattern => {
      const normalizedType = normalizeErrorType(pattern.Muster || 'Unbekannt');
      types.add(normalizedType);
    });
    
    return Array.from(types);
  }, [patternData]);
  
  // Wir verwenden jetzt die zentrale Farbpalette aus ErrorTypeUtils
  const getTypeColor = (type) => {
    return getErrorTypeColor(type, 'hex');
  };
  
  // Bestimme den automatischen Anzeigemodus basierend auf den Daten
  const autoViewMode = useMemo(() => {
    if (!patternData || patternData.length === 0) return 'day';
    
    const dates = patternData.map(pattern => new Date(pattern.Zeitpunkt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    
    return daysDiff > 2 ? 'day' : 'hour';
  }, [patternData]);
  
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
  
  // Benutzerdefinierter Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Berechne die Gesamtsumme für diesen Zeitpunkt
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            entry.value > 0 && (
              <div key={index} className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 mr-2" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{entry.name}:</span>
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium text-sm ml-4">
                  {entry.value} ({Math.round(entry.value / total * 100)}%)
                </span>
              </div>
            )
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-gray-800 dark:text-gray-200">
              <span className="font-medium">Gesamt:</span>
              <span className="font-medium">{total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Chart-Inhalt
  const chartContent = (
    <div>
      {chartData.length > 0 ? (
        <div className="p-4 bg-white dark:bg-gray-800">
          {/* Umschaltknöpfe für die Ansicht */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`px-4 py-1 text-xs font-medium ${viewMode === 'auto' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} rounded-l-md`}
                onClick={() => setViewMode('auto')}
              >
                Auto ({autoViewMode === 'day' ? 'Tag' : 'Stunde'})
              </button>
              <button
                type="button"
                className={`px-4 py-1 text-xs font-medium ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setViewMode('day')}
              >
                Tag
              </button>
              <button
                type="button"
                className={`px-4 py-1 text-xs font-medium ${viewMode === 'hour' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} rounded-r-md`}
                onClick={() => setViewMode('hour')}
              >
                Stunde
              </button>
            </div>
          </div>
          
          {/* Legende */}
          <div className="mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded transition-colors duration-200">
            <div className="flex flex-wrap gap-3 text-xs">
              {patternTypes.map((type) => {
                const isHidden = hiddenTypes.includes(type);
                return (
                  <div 
                    key={type} 
                    className="flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    onClick={() => {
                      if (isHidden) {
                        setHiddenTypes(hiddenTypes.filter(t => t !== type));
                      } else {
                        setHiddenTypes([...hiddenTypes, type]);
                      }
                    }}
                  >
                    <div 
                      className={`w-4 h-4 mr-1 rounded ${isHidden ? 'opacity-30' : ''}`} 
                      style={{ backgroundColor: getTypeColor(type) }}
                    ></div>
                    <span className={`text-gray-700 dark:text-gray-300 ${isHidden ? 'line-through opacity-50' : ''}`}>{type}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Diagramm */}
          <div style={{ height: '400px' }} className="w-full bg-white dark:bg-gray-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                style={{ backgroundColor: 'inherit' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
                <XAxis 
                  dataKey="display" 
                  tick={{ fill: '#666', className: 'dark:fill-gray-300' }}
                  label={{ 
                    value: viewMode === 'auto' 
                      ? `Zeitraum: ${autoViewMode === 'day' ? 'Tage' : 'Stunden'}`
                      : `Zeitraum: ${viewMode === 'day' ? 'Tage' : 'Stunden'}`, 
                    position: 'insideBottom', 
                    offset: -10, 
                    fill: '#666', 
                    className: 'dark:fill-gray-300' 
                  }}
                />
                <YAxis 
                  tick={{ fill: '#666', className: 'dark:fill-gray-300' }}
                  label={{ 
                    value: 'Anzahl der Fehler', 
                    angle: -90, 
                    position: 'center',
                    offset: 0,
                    fill: '#666', 
                    className: 'dark:fill-gray-300',
                    style: {
                      textAnchor: 'middle'
                    }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ display: 'none' }} />
                
                {patternTypes
                  .filter(type => !hiddenTypes.includes(type))
                  .map((type) => (
                    <Bar 
                      key={type}
                      dataKey={type}
                      stackId="a"
                      fill={getTypeColor(type)}
                      name={type}
                    />
                  ))}
              </BarChart>
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
      title="Fehlertypen-Verteilung"
      icon={chartIcon}
      collapsible={true}
      defaultExpanded={true}
      className="col-span-1 lg:col-span-2"
    >
      {chartContent}
    </WidgetCard>
  );
};

export default ErrorStackedBarWidget;
