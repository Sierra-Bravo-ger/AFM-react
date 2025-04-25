/**
 * AdvancedMetrics.jsx
 * Erweiterte Berechnungen und KPIs für das AFM Dashboard
 */

/**
 * Berechnet die Systemgesundheit basierend auf verschiedenen Metriken
 * @param {Object} statusStats - Ergebnis von calculateStatusStatistics
 * @param {Array} errorData - Fehlerdaten
 * @param {Array} inputData - Eingabedaten
 * @param {Object} patternAnalysis - Ergebnis von analyzePatternMatches
 * @returns {Object} - Systemgesundheits-Metriken
 */
export const calculateSystemHealth = (statusStats, errorData, inputData, patternAnalysis) => {
  // Fehlerrate berechnen
  const errorRate = calculateErrorRate(statusStats, patternAnalysis);
  
  // Durchsatz berechnen (Dateien pro Stunde)
  const throughput = calculateThroughput(statusStats, inputData);
  
  // Fehlertrend berechnen
  const errorTrend = calculateErrorTrend(errorData);
  
  // Systemgesundheit berechnen (0-100%)
  // Faktoren: Fehlerrate, Durchsatz, Fehlertrend
  let healthScore = 100;
  
  // Fehlerrate reduziert die Gesundheit (höhere Fehlerrate = niedrigere Gesundheit)
  if (errorRate > 0) {
    // Maximale Reduzierung durch Fehlerrate: 40 Punkte
    healthScore -= Math.min(errorRate * 100, 40);
  }
  
  // Niedriger Durchsatz reduziert die Gesundheit
  if (throughput.hourlyAvg < 10) {
    // Maximale Reduzierung durch niedrigen Durchsatz: 30 Punkte
    healthScore -= Math.min((10 - throughput.hourlyAvg) * 3, 30);
  }
  
  // Negativer Fehlertrend reduziert die Gesundheit
  if (errorTrend.trend > 0) {
    // Maximale Reduzierung durch negativen Trend: 30 Punkte
    healthScore -= Math.min(errorTrend.trend * 10, 30);
  }
  
  // Gesundheitsstatus basierend auf Score
  let healthStatus = 'Kritisch';
  if (healthScore >= 90) {
    healthStatus = 'Ausgezeichnet';
  } else if (healthScore >= 75) {
    healthStatus = 'Gut';
  } else if (healthScore >= 50) {
    healthStatus = 'Mittelmäßig';
  } else if (healthScore >= 25) {
    healthStatus = 'Schlecht';
  }
  
  // Anzahl der neuen Dateien im Input-Verzeichnis (diffInput aus statusStats)
  const fileInput = statusStats && statusStats.diffInput ? statusStats.diffInput : 0;
  
  return {
    score: Math.max(0, Math.min(100, healthScore)),
    status: healthStatus,
    errorRate,
    throughput,
    errorTrend,
    fileInput
  };
};

/**
 * Berechnet die Fehlerrate
 * @param {Object} statusStats - Ergebnis von calculateStatusStatistics
 * @param {Object} patternAnalysis - Ergebnis von analyzePatternMatches
 * @returns {number} - Fehlerrate (0-1)
 */
export const calculateErrorRate = (statusStats, patternAnalysis) => {
  if (!statusStats.latestStatus || !statusStats.startStatus || !patternAnalysis) {
    return 0;
  }
  
  // Für die Fehlerrate betrachten wir die Anzahl der erkannten Fehlermuster
  // im Verhältnis zur Gesamtzahl der verarbeiteten Dateien
  const totalArchived = statusStats.diffArchiv > 0 ? statusStats.diffArchiv : 0;
  
  // Gesamtzahl der erkannten Fehlermuster aus patternAnalysis
  const totalPatterns = patternAnalysis.totalPatterns || 0;
  
  // Gesamtzahl der verarbeiteten Dateien (Archiv)
  // Wir verwenden nur die archivierten Dateien als Basis, da sie erfolgreich verarbeitet wurden
  if (totalArchived === 0) {
    return 0;
  }
  
  return totalPatterns / totalArchived;
};

/**
 * Berechnet den Durchsatz (Dateien pro Zeiteinheit)
 * @param {Object} statusStats - Ergebnis von calculateStatusStatistics
 * @param {Array} inputData - Eingabedaten
 * @returns {Object} - Durchsatz-Metriken
 */
export const calculateThroughput = (statusStats, inputData) => {
  if (!statusStats.latestStatus || !statusStats.startStatus || !inputData || inputData.length === 0) {
    return {
      hourlyAvg: 0,
      dailyAvg: 0,
      weeklyAvg: 0,
      total: 0
    };
  }
  
  // Gesamtzahl der verarbeiteten Dateien im Zeitraum
  const totalProcessed = statusStats.diffArchiv > 0 ? statusStats.diffArchiv : 0;
  
  // Zeitraum berechnen (in Stunden)
  const startTime = new Date(statusStats.startStatus.Zeitpunkt);
  const endTime = new Date(statusStats.latestStatus.Zeitpunkt);
  const hoursDiff = Math.max(1, (endTime - startTime) / (1000 * 60 * 60));
  
  // Durchschnittlicher Durchsatz pro Stunde
  const hourlyAvg = totalProcessed / hoursDiff;
  
  return {
    hourlyAvg,
    dailyAvg: hourlyAvg * 24,
    weeklyAvg: hourlyAvg * 24 * 7,
    total: totalProcessed
  };
};

/**
 * Berechnet den Fehlertrend
 * @param {Array} errorData - Fehlerdaten
 * @returns {Object} - Fehlertrend-Metriken
 */
export const calculateErrorTrend = (errorData) => {
  if (!errorData || errorData.length < 2) {
    return {
      trend: 0,
      description: 'Stabil'
    };
  }
  
  // Sortiere Fehlerdaten nach Zeitpunkt
  const sortedErrors = [...errorData].sort((a, b) => 
    new Date(a.Zeitpunkt) - new Date(b.Zeitpunkt)
  );
  
  // Teile den Zeitraum in zwei Hälften
  const midpoint = Math.floor(sortedErrors.length / 2);
  const firstHalf = sortedErrors.slice(0, midpoint);
  const secondHalf = sortedErrors.slice(midpoint);
  
  // Zähle Fehler in beiden Hälften
  const firstHalfCount = firstHalf.length;
  const secondHalfCount = secondHalf.length;
  
  // Berechne den Trend (positive Werte bedeuten mehr Fehler in der zweiten Hälfte)
  const trend = (secondHalfCount - firstHalfCount) / Math.max(1, firstHalfCount);
  
  // Trend-Beschreibung
  let description = 'Stabil';
  if (trend > 0.5) {
    description = 'Stark steigend';
  } else if (trend > 0.1) {
    description = 'Steigend';
  } else if (trend < -0.5) {
    description = 'Stark fallend';
  } else if (trend < -0.1) {
    description = 'Fallend';
  }
  
  return {
    trend,
    description
  };
};

/**
 * Analysiert Fehler nach Tageszeit
 * @param {Array} errorData - Fehlerdaten
 * @returns {Array} - Fehler gruppiert nach Stunde
 */
export const analyzeErrorsByHour = (errorData) => {
  if (!errorData || errorData.length === 0) {
    return Array(24).fill(0);
  }
  
  // Initialisiere Array mit 24 Stunden
  const hourlyErrors = Array(24).fill(0);
  
  // Zähle Fehler pro Stunde
  errorData.forEach(error => {
    const date = new Date(error.Zeitpunkt);
    const hour = date.getHours();
    hourlyErrors[hour]++;
  });
  
  return hourlyErrors;
};

/**
 * Analysiert Fehler nach Wochentag
 * @param {Array} errorData - Fehlerdaten
 * @returns {Array} - Fehler gruppiert nach Wochentag (0 = Sonntag, 6 = Samstag)
 */
export const analyzeErrorsByDay = (errorData) => {
  if (!errorData || errorData.length === 0) {
    return Array(7).fill(0);
  }
  
  // Initialisiere Array mit 7 Tagen
  const dailyErrors = Array(7).fill(0);
  
  // Zähle Fehler pro Wochentag
  errorData.forEach(error => {
    const date = new Date(error.Zeitpunkt);
    const day = date.getDay();
    dailyErrors[day]++;
  });
  
  return dailyErrors;
};

/**
 * Erstellt eine Fehler-Heatmap (Wochentag/Stunde)
 * @param {Array} errorData - Fehlerdaten
 * @returns {Array} - 2D-Array [Tag][Stunde] mit Fehlerzahlen
 */
// Normalisierungsfunktion für Mustertypen
// Wir verwenden jetzt die zentrale Utility-Funktion aus ErrorTypeUtils.jsx

import { normalizeErrorType, extractErrorType } from './ErrorTypeUtils';

export const createErrorHeatmap = (errorData, selectedErrorType = null) => {
  if (!errorData || errorData.length === 0) {
    return {
      heatmap: Array(7).fill().map(() => Array(24).fill(0)),
      errorTypes: [],
      errorTypeCounts: {}
    };
  }
  
  // Initialisiere 2D-Array [7 Tage][24 Stunden]
  const heatmap = Array(7).fill().map(() => Array(24).fill(0));
  
  // Sammle Fehlertypen und zähle sie
  const errorTypeCounts = {};
  const filteredData = selectedErrorType ? 
    errorData.filter(error => extractErrorType(error, 'error_log') === selectedErrorType) : 
    errorData;
  
  // Zähle Fehler pro Tag/Stunde
  filteredData.forEach(error => {
    const date = new Date(error.Zeitpunkt);
    const day = date.getDay();
    const hour = date.getHours();
    heatmap[day][hour]++;
    
    // Zähle Fehlertypen
    const errorType = extractErrorType(error, 'error_log');
    errorTypeCounts[errorType] = (errorTypeCounts[errorType] || 0) + 1;
  });
  
  // Extrahiere eindeutige Fehlertypen
  const errorTypes = Object.keys(errorTypeCounts).sort((a, b) => 
    errorTypeCounts[b] - errorTypeCounts[a]
  );
  
  return {
    heatmap,
    errorTypes,
    errorTypeCounts
  };
};
