import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import WidgetCard from '../layout/WidgetCard';

/**
 * ThroughputLineWidget - Zeigt den Durchsatz (verarbeitete Dateien) über Zeit als Liniendiagramm
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.statusData - Die Status-Daten aus der CSV
 * @param {boolean} props.loading - Ladezustand
 */
const ThroughputLineWidget = ({ statusData, loading }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Verarbeite die Daten für das Diagramm
  const chartData = useMemo(() => {
    if (!statusData || statusData.length === 0) return [];
    
    // Bestimme den Zeitraum der Daten
    const dates = statusData.map(status => new Date(status.Zeitpunkt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Berechne die Anzahl der Tage im Zeitraum
    const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    
    // Automatische Auswahl des Anzeigemodus basierend auf dem Zeitraum
    const viewMode = daysDiff > 2 ? 'day' : 'hour';
    
    // Sortiere nach Zeitstempel
    const sortedData = [...statusData].sort((a, b) => new Date(a.Zeitpunkt) - new Date(b.Zeitpunkt));
    
    if (viewMode === 'hour') {
      // Stündliche Gruppierung
      const hourlyData = {};
      
      // Berechne Durchsatz (Änderung in Archiv zwischen aufeinanderfolgenden Zeitpunkten)
      for (let i = 1; i < sortedData.length; i++) {
        const currentEntry = sortedData[i];
        const previousEntry = sortedData[i-1];
        
        const currentArchiv = parseInt(currentEntry.Archiv) || 0;
        const previousArchiv = parseInt(previousEntry.Archiv) || 0;
        
        // Berechne Zeitdifferenz in Stunden
        const currentTime = new Date(currentEntry.Zeitpunkt);
        const previousTime = new Date(previousEntry.Zeitpunkt);
        const timeDiffHours = (currentTime - previousTime) / (1000 * 60 * 60);
        
        // Berechne Durchsatz pro Stunde
        const throughput = timeDiffHours > 0 
          ? Math.round((currentArchiv - previousArchiv) / timeDiffHours) 
          : 0;
        
        // Füge Datenpunkt hinzu, wenn Durchsatz positiv ist
        if (throughput >= 0) {
          const hour = `${currentTime.getHours()}:00`;
          
          if (!hourlyData[hour]) {
            hourlyData[hour] = {
              timestamp: currentEntry.Zeitpunkt,
              hour: hour,
              hourValue: currentTime.getHours(),
              throughput: throughput,
              archivCount: currentArchiv,
              display: hour,
              viewMode: 'hour'
            };
          } else {
            // Bei mehreren Einträgen pro Stunde den höchsten Durchsatz nehmen
            if (throughput > hourlyData[hour].throughput) {
              hourlyData[hour].throughput = throughput;
              hourlyData[hour].timestamp = currentEntry.Zeitpunkt;
              hourlyData[hour].archivCount = currentArchiv;
            }
          }
        }
      }
      
      // Konvertiere in Array und sortiere nach Stunde
      return Object.values(hourlyData)
        .sort((a, b) => a.hourValue - b.hourValue);
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
          throughput: 0,
          archivCount: 0,
          viewMode: 'day'
        };
      }
      
      // Berechne täglichen Durchsatz
      // Gruppiere zuerst nach Tagen
      const dailyEntries = {};
      
      sortedData.forEach(entry => {
        const date = new Date(entry.Zeitpunkt);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dailyEntries[dateKey]) {
          dailyEntries[dateKey] = [];
        }
        
        dailyEntries[dateKey].push(entry);
      });
      
      // Berechne Durchsatz für jeden Tag
      Object.keys(dailyEntries).forEach(dateKey => {
        const entries = dailyEntries[dateKey].sort((a, b) => new Date(a.Zeitpunkt) - new Date(b.Zeitpunkt));
        
        if (entries.length > 1) {
          const firstEntry = entries[0];
          const lastEntry = entries[entries.length - 1];
          
          const firstArchiv = parseInt(firstEntry.Archiv) || 0;
          const lastArchiv = parseInt(lastEntry.Archiv) || 0;
          
          const firstTime = new Date(firstEntry.Zeitpunkt);
          const lastTime = new Date(lastEntry.Zeitpunkt);
          const timeDiffHours = (lastTime - firstTime) / (1000 * 60 * 60);
          
          const dailyThroughput = timeDiffHours > 0 
            ? Math.round((lastArchiv - firstArchiv) / timeDiffHours) 
            : 0;
          
          if (dailyThroughput >= 0 && dailyData[dateKey]) {
            dailyData[dateKey].throughput = dailyThroughput;
            dailyData[dateKey].archivCount = lastArchiv;
          }
        }
      });
      
      // Konvertiere in Array und sortiere nach Datum
      return Object.values(dailyData)
        .sort((a, b) => a.date - b.date);
    }
  }, [statusData]);
  
  // Bestimme den maximalen Durchsatz für die Y-Achse
  const maxThroughput = useMemo(() => {
    if (chartData.length === 0) return 100;
    const max = Math.max(...chartData.map(item => item.throughput));
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
                  domain={[0, maxThroughput]}
                  label={{ 
                    value: 'Durchsatz (Dateien/Stunde)', 
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
                  formatter={(value, name) => [`${value} Dateien/h`, 'Durchsatz']}
                  labelFormatter={(time) => `Zeitpunkt: ${time}`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="throughput" 
                  name="Durchsatz (Dateien/Stunde)"
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1, fill: '#10B981' }}
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
      title="Durchsatz über Zeit"
      icon={chartIcon}
      collapsible={true}
      defaultExpanded={true}
    >
      {chartContent}
    </WidgetCard>
  );
};

export default ThroughputLineWidget;
