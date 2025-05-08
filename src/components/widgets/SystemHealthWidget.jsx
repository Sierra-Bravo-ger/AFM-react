import React, { useMemo, useCallback, memo } from 'react';
import WidgetCard from '../layout/WidgetCard';
import StatusIndicator from './StatusIndicator';
import GaugeChart from './GaugeChart';

/**
 * Widget zur Anzeige der Systemgesundheit
 * @param {Object} systemHealth - Systemgesundheits-Daten aus calculateSystemHealth
 */
const SystemHealthWidget = memo(({ systemHealth }) => {
  // Keine Daten Ansicht - memoiziert für bessere Performance
  const NoDataView = useMemo(() => (
    <WidgetCard title="System-Gesundheit">
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 dark:text-gray-400">Keine Daten verfügbar</p>
      </div>
    </WidgetCard>
  ), []);

  // Farbe basierend auf Gesundheitsscore - memoiziert für bessere Performance
  const getHealthColor = useCallback((score) => {
    if (score >= 90) return 'text-green-500 dark:text-green-400';
    if (score >= 75) return 'text-green-500 dark:text-green-400';
    if (score >= 50) return 'text-yellow-500 dark:text-yellow-400';
    if (score >= 25) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-500 dark:text-red-400';
  }, []);

  // Farbe für Fehlertrend - memoiziert für bessere Performance
  const getTrendColor = useCallback((trend) => {
    if (trend.includes('fallend')) return 'text-green-500 dark:text-green-400';
    if (trend.includes('steigend')) return 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  }, []);
  
  // Hilfsfunktionen für die Fehlerrate-Anzeige - memoiziert für bessere Performance
  const getErrorRateBackground = useCallback((rate) => {
    const percentage = rate * 100;
    if (percentage < 5) return 'bg-green-100 dark:bg-green-900/30';
    if (percentage < 10) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  }, []);
  
  const getErrorRateTextColor = useCallback((rate) => {
    const percentage = rate * 100;
    if (percentage < 5) return 'text-green-800 dark:text-green-100';
    if (percentage < 10) return 'text-yellow-800 dark:text-yellow-100';
    return 'text-red-800 dark:text-red-100';
  }, []);
  
  const getErrorRateDotColor = useCallback((rate) => {
    const percentage = rate * 100;
    if (percentage < 5) return 'bg-green-500 dark:bg-green-400';
    if (percentage < 10) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-red-500 dark:bg-red-400';
  }, []);
  
  const getErrorRateValueColor = useCallback((rate) => {
    const percentage = rate * 100;
    if (percentage < 5) return 'text-green-700 dark:text-green-300';
    if (percentage < 10) return 'text-yellow-700 dark:text-yellow-300';
    return 'text-red-700 dark:text-red-300';
  }, []);
  
  const getErrorRateLabel = useCallback((rate) => {
    const percentage = rate * 100;
    if (percentage < 5) return 'System OK';
    if (percentage < 10) return 'Warnung';
    return 'Kritischer Fehler';
  }, []);
  
  // Hilfsfunktion für den Datei-Eingang-Status - memoiziert für bessere Performance
  const getFileInputStatus = useMemo(() => {
    if (!systemHealth) return null;
    
    // Prüfen, ob Datei-Eingang aktiv ist (neue Dateien im Input-Verzeichnis)
    const fileInput = systemHealth.fileInput || 0;
    const throughput = systemHealth.throughput?.hourlyAvg || 0;
    
    // Status basierend auf Datei-Eingang und Durchsatz
    if (fileInput > 50) {
      // Dateien stauen sich an (niedriger Durchsatz bei vorhandenen Dateien)
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-100',
        dot: 'bg-red-500 dark:bg-red-400',
        value: 'text-red-700 dark:text-red-300',
        label: 'Dateistau',
        showValue: true,
        valueLabel: `${fileInput} Input Dateien`
      };
    } else if (throughput >= 10) {
      // Ausreichender Durchsatz - System arbeitet gut
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-100',
        dot: 'bg-green-500 dark:bg-green-400',
        value: 'text-green-700 dark:text-green-300',
        label: 'Aktiv',
        showValue: false,
        valueLabel: ''
      };
    } else {
      // Niedriger Durchsatz und keine neuen Dateien - mögliches Problem
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-100',
        dot: 'bg-yellow-500 dark:bg-yellow-400',
        value: 'text-yellow-700 dark:text-yellow-300',
        label: 'Datei-Eingang inaktiv',
        showValue: true,
        valueLabel: 'Keine neuen Dateien'
      };
    }
  }, [systemHealth]);

  // Widget-Inhalt - memoiziert für bessere Performance
  // Alle Hooks müssen vor bedingten Rückgaben aufgerufen werden
  const widgetContent = useMemo(() => {
    if (!systemHealth) {
      return (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 dark:text-gray-400">Keine Daten verfügbar</p>
        </div>
      );
    }
    
    return (
    <div className="flex flex-col items-center p-4">
      {/* Gauge-Chart mit Prozentwert innerhalb */}
      <div className="mb-2 px-12 w-full max-w-sm">
        <GaugeChart value={systemHealth.score} size="md" showValue={true} showValueInside={true} />
      </div>
      
      {/* Nur Status unten */}
      <div className="text-center mb-4">
        <div className={`text-xl font-medium ${getHealthColor(systemHealth.score)}`}>
          {systemHealth.status}
        </div>
      </div>
        
      <div className="grid grid-cols-2 gap-4 mt-6 w-full">
        <div className={`p-4 rounded-lg shadow-sm ${getErrorRateBackground(systemHealth.errorRate)}`}>
          <div className="text-sm text-gray-500 dark:text-gray-400">Fehlerrate</div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              {/* Statusindikator mit Farbe basierend auf Fehlerrate */}
              <div 
                className={`w-2 h-2 rounded-full mr-2 animate-pulse ${getErrorRateDotColor(systemHealth.errorRate)}`}
              ></div>
              {/* Label mit Farbe basierend auf Fehlerrate */}
              <span 
                className={`font-medium ${getErrorRateTextColor(systemHealth.errorRate)}`}
              >
                {getErrorRateLabel(systemHealth.errorRate)}
              </span>
            </div>
            {/* Wert mit Farbe basierend auf Fehlerrate */}
            <span 
              className={`text-sm px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 ${getErrorRateValueColor(systemHealth.errorRate)}`}
            >
              {(systemHealth.errorRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
          
          <StatusIndicator 
            label="Durchsatz/h" 
            value={Math.round(systemHealth.throughput.hourlyAvg)} 
            thresholds={[
              { value: 100, status: 'error', label: 'Zu niedrig' },
              { value: 150, status: 'warning', label: 'Niedrig' },
              { value: 200, status: 'ok', label: 'Optimal' }
            ]}
            inverse={true}
          />
          
          <StatusIndicator 
            label="Fehlertrend" 
            value={systemHealth.errorTrend.description} 
            thresholds={[
              { value: 'Fallend', status: 'ok', label: 'Verbesserung' },
              { value: 'Stark fallend', status: 'ok', label: 'Starke Verbesserung' },
              { value: 'Stabil', status: 'warning', label: 'Stabil' },
              { value: 'Steigend', status: 'error', label: 'Verschlechterung' },
              { value: 'Stark steigend', status: 'error', label: 'Kritische Verschlechterung' }
            ]}
          />
          
          <StatusIndicator 
            label="Verarbeitet" 
            value={systemHealth.throughput.total} 
            thresholds={[
              { value: 0, status: 'ok', label: 'Gesamt' }
            ]}
          />
          
        <div className={`p-4 rounded-lg shadow-sm ${getFileInputStatus?.bg}`}>
          <div className="text-sm text-gray-500 dark:text-gray-400">Datei-Eingang</div>
          <div className="flex justify-between items-center mt-2">
            <div className={`flex items-center ${getFileInputStatus?.text}`}>
              <div className={`w-2 h-2 ${getFileInputStatus?.dot} rounded-full mr-2 animate-pulse`}></div>
              <span className="font-medium">{getFileInputStatus?.label}</span>
            </div>
            {/* Wert nur anzeigen, wenn nicht aktiv (bei Dateistau oder Inaktivität) */}
            {getFileInputStatus?.showValue && (
              <span className={`text-sm px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 ${getFileInputStatus?.value}`}>
                {getFileInputStatus?.valueLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  }, [systemHealth, getHealthColor, getErrorRateBackground, getErrorRateDotColor, getErrorRateTextColor, 
      getErrorRateLabel, getErrorRateValueColor, getFileInputStatus]);
  
  // Jetzt können wir das Widget rendern, nachdem alle Hooks aufgerufen wurden
  return (
    <WidgetCard title="System-Gesundheit">
      {widgetContent}
    </WidgetCard>
  );
});

export default SystemHealthWidget;
