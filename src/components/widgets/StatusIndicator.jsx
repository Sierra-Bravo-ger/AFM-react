import React from 'react';

/**
 * Statusindikator-Komponente mit dynamischen Schwellenwerten
 * @param {Object} props - Komponenten-Props
 * @param {string} props.label - Beschriftung des Indikators
 * @param {number|string} props.value - Aktueller Wert
 * @param {string} props.unit - Einheit des Werts (optional, z.B. '%', 'ms')
 * @param {Array} props.thresholds - Schwellenwerte für Farbänderungen
 *   [{ value: number, status: 'ok'|'warning'|'error', label: string }]
 * @param {boolean} props.inverse - Wenn true, werden die Schwellenwerte umgekehrt interpretiert
 *   (z.B. bei Verfügbarkeit ist höher besser, bei Fehlerrate ist niedriger besser)
 */
const StatusIndicator = ({ 
  label, 
  value, 
  unit = '', 
  thresholds = [],
  inverse = false
}) => {
  // Stelle sicher, dass wir mit einem numerischen Wert arbeiten, wenn möglich
  const numericValue = typeof value === 'number' ? value : 
                      !isNaN(Number(value)) ? Number(value) : value;
  
  // Bestimme den aktuellen Status und Label basierend auf Schwellenwerten
  const determineStatus = () => {
    // Wenn keine Schwellenwerte definiert sind, verwende 'ok' als Standard
    if (!thresholds || thresholds.length === 0) {
      return { status: 'ok', label: 'OK' };
    }
    
    // Bei String-Werten (z.B. für Fehlertrend)
    if (typeof numericValue === 'string') {
      const matchingThreshold = thresholds.find(t => t.value === numericValue);
      return matchingThreshold ? 
        { status: matchingThreshold.status, label: matchingThreshold.label } : 
        { status: 'ok', label: 'OK' };
    }
    
    // Sortiere Schwellenwerte (aufsteigend)
    const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);
    
    // Für numerische Werte
    if (inverse) {
      // Inverse Logik: Kleinere Werte sind besser (z.B. Durchsatz)
      for (const threshold of sortedThresholds) {
        if (numericValue < threshold.value) {
          return { status: threshold.status, label: threshold.label };
        }
      }
      // Wenn kein Schwellenwert getroffen wurde, verwende den letzten
      const lastThreshold = sortedThresholds[sortedThresholds.length - 1];
      return { 
        status: lastThreshold.status, 
        label: lastThreshold.label 
      };
    } else {
      // Standard-Logik: Größere Werte sind schlechter (z.B. Fehlerrate)
      for (const threshold of sortedThresholds) {
        if (numericValue >= threshold.value) {
          return { status: threshold.status, label: threshold.label };
        }
      }
      // Wenn kein Schwellenwert getroffen wurde, verwende den ersten
      const firstThreshold = sortedThresholds[0];
      return { 
        status: firstThreshold.status, 
        label: firstThreshold.label 
      };
    }
  };
  
  // Farben für verschiedene Status
  const getStatusColors = (status) => {
    switch (status) {
      case 'error':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-100',
          dot: 'bg-red-500 dark:bg-red-400',
          value: 'bg-white dark:bg-gray-800 text-red-700 dark:text-red-300'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-800 dark:text-yellow-100',
          dot: 'bg-yellow-500 dark:bg-yellow-400',
          value: 'bg-white dark:bg-gray-800 text-yellow-700 dark:text-yellow-300'
        };
      case 'ok':
      default:
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-800 dark:text-green-100',
          dot: 'bg-green-500 dark:bg-green-400',
          value: 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-300'
        };
    }
  };

  // Bestimme Status und Label
  const { status, label: statusLabel } = determineStatus();
  const colors = getStatusColors(status);
  
  // Formatiere den Anzeigewert
  const displayValue = typeof numericValue === 'number' ? 
    numericValue.toLocaleString('de-DE') : numericValue;

  return (
    <div className={`p-4 rounded-lg shadow-sm ${colors.bg}`}>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="flex justify-between items-center mt-2">
        <div className={`flex items-center ${colors.text}`}>
          <div className={`w-2 h-2 ${colors.dot} rounded-full mr-2 animate-pulse`}></div>
          <span className="font-medium">{statusLabel}</span>
        </div>
        <span className={`text-sm px-2 py-0.5 rounded-full ${colors.value}`}>
          {displayValue}{unit}
        </span>
      </div>
    </div>
  );
};

export default StatusIndicator;
