import React, { useState, useMemo, useCallback, memo } from 'react';
import WidgetCard from '../layout/WidgetCard';
import { normalizeErrorType, getErrorTypeColor, ERROR_TYPE_COLORS } from '../../utils/ErrorTypeUtils';

/**
 * Widget zur Anzeige der Fehler-Heatmap (Wochentag/Stunde)
 * @param {Object} errorHeatmapData - Objekt mit Heatmap-Daten, Fehlertypen und Fehlertypenzählungen
 * @param {Function} onFilterChange - Callback-Funktion, die bei Änderung des Fehlertyp-Filters aufgerufen wird
 * @param {boolean} loading - Gibt an, ob die Daten noch geladen werden
 */
const ErrorHeatmapWidget = memo(({ errorHeatmapData, onFilterChange, loading = false }) => {
  // State für den ausgewählten Fehlertyp
  const [selectedErrorType, setSelectedErrorType] = useState(null);

  // Handler für Klick auf einen Fehlertyp-Filter-Button - memoiziert für bessere Performance
  const handleErrorTypeClick = useCallback((errorType) => {
    // Wenn der gleiche Fehlertyp erneut angeklickt wird, setze den Filter zurück
    const newSelectedType = selectedErrorType === errorType ? null : errorType;
    setSelectedErrorType(newSelectedType);
    
    // Informiere die übergeordnete Komponente über die Änderung
    if (onFilterChange) {
      onFilterChange(newSelectedType);
    }
  }, [selectedErrorType, onFilterChange]);

  // Icon für das Widget - memoiziert, um unnötige Re-Renderings zu vermeiden
  const heatmapIcon = useMemo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ), []);

  // Ladeansicht - memoiziert für bessere Performance
  const LoadingSkeleton = useMemo(() => (
    <WidgetCard title="Fehler-Heatmap (Wochentag/Stunde)" icon={heatmapIcon}>
      <div className="flex flex-col justify-center items-center h-64 p-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Lade Heatmap-Daten...</p>
      </div>
    </WidgetCard>
  ), [heatmapIcon]);

  // Keine Daten verfügbar - memoiziert für bessere Performance
  const NoDataView = useMemo(() => (
    <WidgetCard title="Fehler-Heatmap (Wochentag/Stunde)" icon={heatmapIcon}>
      <div className="flex justify-center items-center h-64 p-4">
        <p className="text-gray-500 dark:text-gray-400">Keine Daten verfügbar</p>
      </div>
    </WidgetCard>
  ), [heatmapIcon]);

  // Extrahiere die Heatmap-Daten und Fehlertypen, wenn verfügbar
  const heatmapData = useMemo(() => {
    if (!errorHeatmapData || !errorHeatmapData.heatmap) {
      return { heatmap: null, errorTypes: [], errorTypeCounts: {} };
    }
    return errorHeatmapData;
  }, [errorHeatmapData]);

  // Wochentagsnamen - konstant, daher außerhalb der Komponente definiert
  const dayNames = useMemo(() => ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], []);
  
  // Maximalen Wert finden für die Farbskalierung - memoiziert für bessere Performance
  const maxValue = useMemo(() => {
    let max = 0;
    if (heatmapData.heatmap) {
      heatmapData.heatmap.forEach(day => {
        day.forEach(hour => {
          if (hour > max) max = hour;
        });
      });
    }
    return max;
  }, [heatmapData.heatmap]);

  // Farbintensität basierend auf dem Wert (0-100%) - memoiziert für bessere Performance
  const getColorIntensity = useCallback((value) => {
    if (maxValue === 0) return 0;
    return Math.min(100, Math.round((value / maxValue) * 100));
  }, [maxValue]);

  // Hintergrundfarbe für die Zelle - memoiziert für bessere Performance
  const getCellColor = useCallback((value) => {
    const intensity = getColorIntensity(value);
    return `rgba(239, 68, 68, ${intensity / 100})`; // Rot mit variabler Intensität
  }, [getColorIntensity]);

  // Textfarbe basierend auf der Intensität (dunkel für helle Zellen, hell für dunkle Zellen) - memoiziert für bessere Performance
  const getTextColor = useCallback((value) => {
    const intensity = getColorIntensity(value);
    return intensity > 50 ? 'text-white' : 'text-gray-700 dark:text-gray-300';
  }, [getColorIntensity]);
  
  // Render-Logik
  if (loading) {
    return LoadingSkeleton;
  }
  
  if (!heatmapData.heatmap) {
    return NoDataView;
  }
  
  // Extrahiere die Daten aus dem memoizierten Objekt
  const { heatmap, errorTypes, errorTypeCounts } = heatmapData;

  return (
    <WidgetCard 
      title="Fehler-Heatmap (Wochentag/Stunde)" 
      icon={heatmapIcon}
    >
      <div className="p-4 flex flex-col w-full">
        {/* Fehlertyp-Filter-Buttons */}
        {errorTypes && errorTypes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Nach Fehlertyp filtern:</p>
            <div className="flex flex-wrap gap-2">
              {/* Button zum Zurücksetzen des Filters */}
              <button
                onClick={() => handleErrorTypeClick(null)}
                className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${selectedErrorType === null
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Alle
              </button>
              {errorTypes.map(errorType => {
                // Normalisiere den Fehlertyp für konsistente Anzeige
                const normalizedType = normalizeErrorType(errorType);
                return (
                  <button
                    key={errorType}
                    onClick={() => handleErrorTypeClick(errorType)}
                    className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${selectedErrorType === errorType
                      ? `${getErrorTypeColor(normalizedType, 'bg')} text-white`
                      : `bg-gray-200 ${getErrorTypeColor(normalizedType, 'text')} dark:bg-gray-700 dark:text-gray-300`
                    }`}
                    style={selectedErrorType === errorType ? {} : { borderLeft: `3px solid ${getErrorTypeColor(normalizedType)}` }}
                  >
                    <span>{normalizedType}</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                      {errorTypeCounts[errorType] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Heatmap-Tabelle */}
        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 w-10"></th>
                {Array.from({ length: 24 }, (_, i) => (
                  <th key={i} className="px-1 py-1 text-xs text-gray-500 dark:text-gray-400 w-auto">
                    {i}h
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmap.map((day, dayIndex) => (
                <tr key={dayIndex}>
                  <td className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {dayNames[dayIndex]}
                  </td>
                  {day.map((count, hourIndex) => (
                    <td 
                      key={hourIndex}
                      className={`px-1 py-1 text-xs text-center ${getTextColor(count)}`}
                      style={{ 
                        backgroundColor: getCellColor(count),
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
        
        {/* Zusammenfassung */}
        {selectedErrorType && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Zeigt nur Fehler vom Typ: <span className="font-medium" style={{ color: getErrorTypeColor(selectedErrorType) }}>{selectedErrorType}</span>
          </div>
        )}
        
        {/* Farbskala-Legende */}
        <div className="mt-4 flex items-center justify-center w-full">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Weniger</span>
            <div className="w-24 h-3 mx-2 rounded-full" style={{ background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 1))' }}></div>
            <span>Mehr</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
});

// Exportiere die memoizierte Komponente mit einem sinnvollen Vergleich der Props
// Nur neu rendern, wenn sich errorHeatmapData, onFilterChange oder loading ändern
export default ErrorHeatmapWidget;
