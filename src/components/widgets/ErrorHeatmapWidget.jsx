import React from 'react';
import WidgetCard from '../layout/WidgetCard';

/**
 * Widget zur Anzeige der Fehler-Heatmap (Wochentag/Stunde)
 * @param {Array} errorHeatmap - 2D-Array [Tag][Stunde] mit Fehlerzahlen aus createErrorHeatmap
 */
const ErrorHeatmapWidget = ({ errorHeatmap }) => {
  if (!errorHeatmap) {
    return (
      <WidgetCard title="Fehler-Heatmap (Wochentag/Stunde)">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 dark:text-gray-400">Keine Daten verfügbar</p>
        </div>
      </WidgetCard>
    );
  }

  // Wochentagsnamen
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  
  // Maximalen Wert finden für die Farbskalierung
  let maxValue = 0;
  errorHeatmap.forEach(day => {
    day.forEach(hour => {
      if (hour > maxValue) maxValue = hour;
    });
  });

  // Farbintensität basierend auf dem Wert (0-100%)
  const getColorIntensity = (value) => {
    if (maxValue === 0) return 0;
    return Math.min(100, Math.round((value / maxValue) * 100));
  };

  // Hintergrundfarbe für die Zelle
  const getCellColor = (value) => {
    const intensity = getColorIntensity(value);
    return `rgba(239, 68, 68, ${intensity / 100})`; // Rot mit variabler Intensität
  };

  // Textfarbe basierend auf der Intensität (dunkel für helle Zellen, hell für dunkle Zellen)
  const getTextColor = (value) => {
    const intensity = getColorIntensity(value);
    return intensity > 50 ? 'text-white' : 'text-gray-700 dark:text-gray-300';
  };

  // Icon für das Widget
  const heatmapIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );

  return (
    <WidgetCard 
      title="Fehler-Heatmap (Wochentag/Stunde)" 
      icon={heatmapIcon}
    >
      <div className="p-4 flex flex-col items-center">
        <div className="overflow-x-auto w-full flex justify-center">
          <table className="mx-auto">
            <thead>
              <tr>
                <th className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400"></th>
                {Array.from({ length: 24 }, (_, i) => (
                  <th key={i} className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {errorHeatmap.map((day, dayIndex) => (
                <tr key={dayIndex}>
                  <td className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {dayNames[dayIndex]}
                  </td>
                  {day.map((count, hourIndex) => (
                    <td 
                      key={hourIndex}
                      className={`px-2 py-1 text-xs text-center ${getTextColor(count)}`}
                      style={{ 
                        backgroundColor: getCellColor(count),
                        width: '22px',
                        height: '22px'
                      }}
                    >
                      {count > 0 ? count : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-center w-full">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Weniger</span>
            <div className="mx-2 flex">
              <div className="w-4 h-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0)' }}></div>
              <div className="w-4 h-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)' }}></div>
              <div className="w-4 h-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)' }}></div>
              <div className="w-4 h-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.75)' }}></div>
              <div className="w-4 h-4" style={{ backgroundColor: 'rgba(239, 68, 68, 1)' }}></div>
            </div>
            <span>Mehr</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

export default ErrorHeatmapWidget;
