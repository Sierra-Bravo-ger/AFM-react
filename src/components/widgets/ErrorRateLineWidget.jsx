import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import WidgetCard from '../layout/WidgetCard';

/**
 * ErrorRateLineWidget - Zeigt die Fehlerrate über Zeit als Liniendiagramm
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.systemHealth - Die Systemgesundheits-Daten mit der Fehlerrate
 * @param {Array} props.statusData - Die Status-Daten aus der CSV für die Zeitstempel
 * @param {boolean} props.loading - Ladezustand
 */
const ErrorRateLineWidget = ({ systemHealth, statusData, loading }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Verarbeite die Daten für das Diagramm
  const chartData = useMemo(() => {
    if (!systemHealth || !statusData || statusData.length === 0) return [];
    
    // Wir verwenden die bereits berechnete Fehlerrate aus systemHealth
    const errorRate = systemHealth.errorRate * 100;
    
    // Bestimme den Zeitraum der Daten
    const dates = statusData.map(status => new Date(status.Zeitpunkt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Berechne die Anzahl der Tage im Zeitraum
    const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    
    // Automatische Auswahl des Anzeigemodus basierend auf dem Zeitraum
    const viewMode = daysDiff > 2 ? 'day' : 'hour';
    
    if (viewMode === 'hour') {
      // Stündliche Gruppierung
      const hourlyData = {};
      
      // Sammle Zeitstempel aus den Status-Daten und gruppiere nach Stunden
      statusData.forEach(status => {
        const date = new Date(status.Zeitpunkt);
        const hour = `${date.getHours()}:00`;
        
        if (!hourlyData[hour]) {
          hourlyData[hour] = { 
            timestamp: status.Zeitpunkt,
            hour,
            hourValue: date.getHours(),
            archivCount: parseInt(status.Archiv) || 0,
            // Verwende die bereits berechnete Fehlerrate für alle Zeitpunkte
            errorRate: errorRate,
            // Zusätzliche Informationen für die Anzeige
            display: hour,
            viewMode: 'hour'
          };
        } else {
          // Bei mehreren Einträgen pro Stunde den letzten nehmen
          const currentDate = new Date(hourlyData[hour].timestamp);
          if (date > currentDate) {
            hourlyData[hour].timestamp = status.Zeitpunkt;
            hourlyData[hour].archivCount = parseInt(status.Archiv) || 0;
          }
        }
      });
      
      // Konvertiere in Array und sortiere nach Stunde
      return Object.values(hourlyData)
        .sort((a, b) => a.hourValue - b.hourValue)
        .map(item => ({
          ...item,
          // Runde Fehlerrate auf 2 Dezimalstellen
          errorRate: parseFloat(item.errorRate.toFixed(2))
        }));
    } else {
      // Tägliche Gruppierung
      const dailyData = {};
      
      // Initialisiere für jeden Tag im Zeitraum
      for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        const displayDate = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        
        dailyData[dateKey] = {
          timestamp: d.toISOString(),
          date: new Date(d),
          day: d.getDate(),
          month: d.getMonth(),
          display: displayDate,
          errorRate: errorRate,
          archivCount: 0,
          viewMode: 'day'
        };
      }
      
      // Fülle die Daten aus den Status-Daten
      statusData.forEach(status => {
        const date = new Date(status.Zeitpunkt);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dailyData[dateKey]) return; // Überspringe, falls außerhalb des Zeitraums
        
        dailyData[dateKey].archivCount += parseInt(status.Archiv) || 0;
      });
      
      // Konvertiere in Array und sortiere nach Datum
      return Object.values(dailyData)
        .sort((a, b) => a.date - b.date)
        .map(item => ({
          ...item,
          // Runde Fehlerrate auf 2 Dezimalstellen
          errorRate: parseFloat(item.errorRate.toFixed(2))
        }));
    }
  }, [statusData, systemHealth]);
  
  // Bestimme die maximale Fehlerrate für die Y-Achse
  const maxErrorRate = useMemo(() => {
    if (chartData.length === 0) return 10;
    const max = Math.max(...chartData.map(item => item.errorRate));
    return Math.ceil(max * 1.1); // 10% Puffer
  }, [chartData]);
  
  // Chart-Icon
  const chartIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );

  // Chart-Inhalt
  const chartContent = (
    <div>
      {chartData.length > 0 ? (
        <div className="p-4 bg-white dark:bg-gray-800">
          <div style={{ height: '400px' }} className="w-full bg-white dark:bg-gray-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 30, bottom: 40 }}
                style={{ backgroundColor: 'inherit' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
                <XAxis 
                  dataKey={chartData.length > 0 && chartData[0].viewMode === 'day' ? 'display' : 'hour'} 
                  tick={{ fill: '#666', className: 'dark:fill-gray-300' }}
                  label={{ 
                    value: `Zeitraum: ${chartData.length > 0 && chartData[0].viewMode === 'day' ? 
                      `${chartData.length} ${chartData.length === 1 ? 'Tag' : 'Tage'}` : 
                      '1 Tag'}`, 
                    position: 'insideBottom', 
                    offset: -10, 
                    fill: '#666', 
                    className: 'dark:fill-gray-300' 
                  }}
                  angle={chartData.length > 0 && chartData[0].viewMode === 'day' && chartData.length > 7 ? -45 : 0}
                  height={chartData.length > 0 && chartData[0].viewMode === 'day' && chartData.length > 7 ? 60 : 40}
                  textAnchor={chartData.length > 0 && chartData[0].viewMode === 'day' && chartData.length > 7 ? 'end' : 'middle'}
                />
                <YAxis 
                  tick={{ fill: '#666', className: 'dark:fill-gray-300' }}
                  domain={[0, maxErrorRate]}
                  label={{ 
                    value: 'Fehlerrate (%)', 
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
                  formatter={(value, name) => [`${value}%`, 'Fehlerrate']}
                  labelFormatter={(time) => `Zeitpunkt: ${time}`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="errorRate" 
                  name="Fehlerrate (%)" 
                  stroke={systemHealth && systemHealth.errorRate * 100 < 5 ? '#10B981' : 
                         systemHealth && systemHealth.errorRate * 100 < 10 ? '#F59E0B' : 
                         '#EF4444'} 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1, fill: systemHealth && systemHealth.errorRate * 100 < 5 ? '#10B981' : 
                                                  systemHealth && systemHealth.errorRate * 100 < 10 ? '#F59E0B' : 
                                                  '#EF4444' }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
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
      title="Fehlerrate über Zeit"
      icon={chartIcon}
      collapsible={true}
      defaultExpanded={true}
    >
      {chartContent}
    </WidgetCard>
  );
};

export default ErrorRateLineWidget;
