import React, { useState } from 'react';
import WidgetCard from '../layout/WidgetCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * Widget zur Anzeige der Fehleranalyse nach Zeit
 * @param {Array} errorsByHour - Fehler pro Stunde aus analyzeErrorsByHour
 * @param {Array} errorsByDay - Fehler pro Wochentag aus analyzeErrorsByDay
 */
const ErrorTimeAnalysisWidget = ({ errorsByHour, errorsByDay }) => {
  const [activeView, setActiveView] = useState('hour'); // 'hour' oder 'day'

  if (!errorsByHour || !errorsByDay) {
    return (
      <WidgetCard title="Fehler nach Zeit">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 dark:text-gray-400">Keine Daten verfügbar</p>
        </div>
      </WidgetCard>
    );
  }

  // Daten für Stunden-Diagramm
  const hourlyData = errorsByHour.map((count, hour) => ({
    Zeit: `${hour}:00`,
    Anzahl: count
  }));

  // Daten für Wochentag-Diagramm
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const dailyData = errorsByDay.map((count, day) => ({
    Tag: dayNames[day],
    Anzahl: count
  }));

  return (
    <WidgetCard title="Fehler nach Zeit">
      <div className="flex flex-col p-4">
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activeView === 'hour'
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setActiveView('hour')}
            >
              Nach Stunde
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                activeView === 'day'
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setActiveView('day')}
            >
              Nach Wochentag
            </button>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {activeView === 'hour' ? (
              <BarChart
                data={hourlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="Zeit" 
                  tick={{ fill: '#9CA3AF' }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB'
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                  itemStyle={{ color: '#F9FAFB' }}
                />
                <Bar 
                  dataKey="Anzahl" 
                  fill="#EF4444" 
                  name="Fehler"
                />
              </BarChart>
            ) : (
              <BarChart
                data={dailyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="Tag" 
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB'
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                  itemStyle={{ color: '#F9FAFB' }}
                />
                <Bar 
                  dataKey="Anzahl" 
                  fill="#EF4444" 
                  name="Fehler"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
};

export default ErrorTimeAnalysisWidget;
