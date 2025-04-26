import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import WidgetCard from '../layout/WidgetCard';
import { normalizeErrorType, getErrorTypeColor, extractErrorType, ERROR_TYPE_COLORS } from '../../utils/ErrorTypeUtils';

/**
 * ErrorStackedLineWidget - Zeigt die Verteilung von Fehlertypen über Zeit als gestapelte Linien
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.patternData - Die Muster-Daten aus der CSV
 * @param {boolean} props.loading - Ladezustand
 */
const ErrorStackedLineWidget = ({ patternData, loading }) => {
  const [expanded, setExpanded] = useState(false);
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
    const viewMode = daysDiff > 2 ? 'day' : 'hour';
    
    if (viewMode === 'hour') {
      // Stündliche Gruppierung
      const groupedData = {};
      
      // Definiere Zeitintervalle für einen Tag (stündlich)
      const hours = [];
      for (let i = 0; i < 24; i++) {
        hours.push(`${i}:00`);
      }
      
      // Initialisiere leere Datenpunkte für jede Stunde
      hours.forEach(hour => {
        groupedData[hour] = { 
          timestamp: hour,
          display: hour,
          viewMode: 'hour'
        };
      });
      
      // Fülle die Daten aus den Mustern
      patternData.forEach(pattern => {
        const date = new Date(pattern.Zeitpunkt);
        const hour = `${date.getHours()}:00`;
        const patternType = normalizeErrorType(pattern.Muster || 'Unbekannt');
        
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
    } else {
      // Tägliche Gruppierung
      const groupedData = {};
      
      // Initialisiere für jeden Tag im Zeitraum
      for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        const displayDate = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        
        groupedData[dateKey] = {
          timestamp: d.toISOString(),
          date: new Date(d),
          day: d.getDate(),
          month: d.getMonth(),
          display: displayDate,
          viewMode: 'day'
        };
      }
      
      // Fülle die Daten aus den Mustern
      patternData.forEach(pattern => {
        const date = new Date(pattern.Zeitpunkt);
        const dateKey = date.toISOString().split('T')[0];
        const patternType = normalizeErrorType(pattern.Muster || 'Unbekannt');
        
        if (!groupedData[dateKey]) return; // Überspringe, falls außerhalb des Zeitraums
        
        if (!groupedData[dateKey][patternType]) {
          groupedData[dateKey][patternType] = 0;
        }
        
        groupedData[dateKey][patternType] += 1;
      });
      
      // Konvertiere in Array und sortiere nach Datum
      return Object.values(groupedData)
        .sort((a, b) => a.date - b.date);
    }
  }, [patternData]);

  // Extrahiere alle eindeutigen Mustertypen für die Linien
  const patternTypes = useMemo(() => {
    if (!patternData || patternData.length === 0) return [];
    
    const types = new Set();
    patternData.forEach(pattern => {
      const normalizedType = normalizeErrorType(pattern.Muster || 'Unbekannt');
      types.add(normalizedType);
    });
    
    return Array.from(types);
  }, [patternData]);
  
  // Farbpalette für die verschiedenen Mustertypen - hellere Farben für weißes Design
  // Wir verwenden jetzt die zentrale Farbpalette aus ErrorTypeUtils
  const getTypeColor = (type) => {
    return getErrorTypeColor(type, 'hex');
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
            style={{ backgroundColor: getTypeColor(type) }}
          ></div>
          <span className="text-gray-700 dark:text-gray-300">{type}</span>
        </div>
      ))}
    </div>
  );

  // Chart-Inhalt
  const chartContent = (
    <div>
      {chartData.length > 0 ? (
        <div className="p-4 bg-white dark:bg-gray-800">
          {/* Legende innerhalb des Hauptinhalts */}
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
          <div style={{ height: '400px' }} className="w-full bg-white dark:bg-gray-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
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
                  dataKey="display"
                  tick={{ fill: '#9CA3AF' }}
                  label={{ 
                    value: `Zeitraum: ${chartData.length > 0 && chartData[0].viewMode === 'day' ? 
                      `${chartData.length} ${chartData.length === 1 ? 'Tag' : 'Tage'}` : 
                      '1 Tag'}`, 
                    position: 'insideBottom', 
                    offset: -5, 
                    fill: '#9CA3AF' 
                  }}
                  angle={chartData.length > 0 && chartData[0].viewMode === 'day' && chartData.length > 7 ? -45 : 0}
                  height={chartData.length > 0 && chartData[0].viewMode === 'day' && chartData.length > 7 ? 60 : 40}
                  textAnchor={chartData.length > 0 && chartData[0].viewMode === 'day' && chartData.length > 7 ? 'end' : 'middle'}
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
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid var(--tooltip-border, #e0e0e0)', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'var(--tooltip-text, #333)' }}
                  labelStyle={{ color: 'var(--tooltip-label, #333)' }}
                  formatter={(value, name) => [value || 0, name]}
                  labelFormatter={(hour) => `${hour}:00 Uhr`}
                />
                {patternTypes
                  .filter(type => !hiddenTypes.includes(type))
                  .map((type) => (
                    <Area 
                      key={type}
                      type="monotone"
                      dataKey={type}
                      stackId="1"
                      stroke={getTypeColor(type)}
                      strokeWidth={2}
                      fillOpacity={0.1}
                      fill={getTypeColor(type)}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                      dot={{ r: 3, fill: getTypeColor(type), stroke: '#fff', strokeWidth: 1 }}
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
