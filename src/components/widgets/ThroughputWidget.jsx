import React, { useState } from 'react';
import WidgetCard from '../layout/WidgetCard';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Widget zur Anzeige des Durchsatzes
 * @param {Object} throughput - Durchsatz-Daten aus calculateThroughput
 * @param {Array} statusData - Gefilterte Statusdaten für den Zeitraum
 */
const ThroughputWidget = ({ throughput, statusData }) => {
  // Icon für das Widget
  const throughputIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  if (!throughput || !statusData || statusData.length === 0) {
    return (
      <WidgetCard title="Durchsatz" icon={throughputIcon}>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 dark:text-gray-400">Keine Daten verfügbar</p>
        </div>
      </WidgetCard>
    );
  }

  // Einfachere Datenaufbereitung für das Diagramm
  const simplifiedData = [];
  
  // Gruppiere Daten nach Tag (für übersichtlichere Darstellung)
  const groupedByDay = {};
  
  statusData.forEach(entry => {
    const date = new Date(entry.Zeitpunkt);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!groupedByDay[dateKey]) {
      groupedByDay[dateKey] = {
        date: dateKey,
        displayDate: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        Input: 0,
        Archiv: 0,
        Error: 0
      };
    }
    
    // Stelle sicher, dass die Werte als Zahlen vorliegen
    const input = parseInt(entry.Input) || 0;
    const archiv = parseInt(entry.Archiv) || 0;
    
    // Finde den korrekten Schlüssel für die Error-Spalte (mit oder ohne \r)
    const errorKey = Object.keys(entry).find(key => key.startsWith('Error'));
    const errorValue = errorKey ? (parseInt(String(entry[errorKey]).replace(/\r/g, '')) || 0) : 0;
    
    // Nehme den höchsten Wert für jeden Tag (da wir nur den Endstand pro Tag anzeigen wollen)
    groupedByDay[dateKey].Input = Math.max(groupedByDay[dateKey].Input, input);
    groupedByDay[dateKey].Archiv = Math.max(groupedByDay[dateKey].Archiv, archiv);
    groupedByDay[dateKey].Error = Math.max(groupedByDay[dateKey].Error, errorValue);
  });
  
  // Konvertiere das Objekt in ein Array und sortiere es nach Datum
  Object.values(groupedByDay).forEach(dayData => {
    simplifiedData.push({
      ...dayData,
      Total: dayData.Input + dayData.Archiv + dayData.Error
    });
  });
  
  // Sortiere nach Datum
  simplifiedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Berechne den kumulativen Durchsatz für die Trendlinie
  let cumulativeProcessed = 0;
  
  // Berechne den Durchsatz als kumulative Summe
  const trendData = simplifiedData.map((day, index, array) => {
    if (index === 0) {
      // Starte mit einem Basiswert für den ersten Tag
      cumulativeProcessed = Math.round(throughput.dailyAvg) || 10;
    } else {
      // Für die folgenden Tage addieren wir den Zuwachs an archivierten Dateien
      const prevDay = array[index - 1];
      const archiveDiff = day.Archiv - prevDay.Archiv;
      
      // Wenn die Differenz positiv ist, addieren wir sie zum kumulativen Wert
      if (archiveDiff > 0) {
        cumulativeProcessed += archiveDiff;
      } else {
        // Bei negativer Differenz (unwahrscheinlich) addieren wir einen Standardwert
        cumulativeProcessed += Math.round(throughput.dailyAvg) || 10;
      }
    }
    
    // Gib den Tag mit dem kumulativen Durchsatz zurück
    return { ...day, ArchivedDiff: cumulativeProcessed };
  });

  return (
    <WidgetCard title="Durchsatz" icon={throughputIcon}>
      <div className="flex flex-col p-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Pro Stunde</div>
            <div className="text-xl font-semibold dark:text-gray-200">
              {Math.round(throughput.hourlyAvg)}
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Pro Tag</div>
            <div className="text-xl font-semibold dark:text-gray-200">
              {Math.round(throughput.dailyAvg)}
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Gesamt</div>
            <div className="text-xl font-semibold dark:text-gray-200">
              {throughput.total.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="h-64">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fill: '#9CA3AF' }}
                  label={{ 
                    value: 'Datum', 
                    position: 'insideBottom', 
                    offset: -10,
                    fill: '#9CA3AF'
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#9CA3AF' }}
                  label={{ 
                    value: 'Bestand', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: '#9CA3AF' }
                  }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fill: '#9CA3AF' }}
                  label={{ 
                    value: 'Kumulativ verarbeitet', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { fill: '#9CA3AF' }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB'
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                  itemStyle={{ color: '#F9FAFB' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar 
                  yAxisId="left"
                  dataKey="Input" 
                  stackId="a" 
                  fill="#3B82F6" 
                  name="Eingang"
                />
                <Bar 
                  yAxisId="left"
                  dataKey="Archiv" 
                  stackId="a" 
                  fill="#10B981" 
                  name="Archiviert"
                />
                <Bar 
                  yAxisId="left"
                  dataKey="Error" 
                  stackId="a" 
                  fill="#EF4444" 
                  name="Fehler-Dateien"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ArchivedDiff"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Kumulativ verarbeitet"
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Keine Daten für den ausgewählten Zeitraum</p>
            </div>
          )}
        </div>
      </div>
    </WidgetCard>
  );
};

export default ThroughputWidget;
