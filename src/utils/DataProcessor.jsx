/**
 * DataProcessor.jsx
 * Utility für die Verarbeitung und Analyse der CSV-Daten
 */

/**
 * Gruppiert Fehlermeldungen nach Typ
 * @param {Array} errorData - Daten aus der AFM_error_log.csv
 * @returns {Object} - Gruppierte Fehlermeldungen
 */
export const groupErrorsByType = (errorData) => {
  const errorGroups = {};
  
  errorData.forEach(error => {
    const errorType = error.Fehlermeldung || 'Unbekannt';
    
    if (!errorGroups[errorType]) {
      errorGroups[errorType] = [];
    }
    
    errorGroups[errorType].push(error);
  });
  
  return errorGroups;
};

/**
 * Zählt die Anzahl der Dateien pro Zeitpunkt
 * @param {Array} inputData - Daten aus der AFM_input_details.csv
 * @returns {Array} - Anzahl der Dateien pro Zeitpunkt
 */
export const countFilesByTimestamp = (inputData) => {
  return inputData.map(entry => ({
    Zeitpunkt: entry.Zeitpunkt,
    Anzahl: parseInt(entry.Anzahl) || 0,
    Dateien: entry.Dateinamen ? entry.Dateinamen.split(',') : []
  }));
};

/**
 * Berechnet Statistiken für die Status-Daten
 * @param {Array} statusData - Daten aus der AFM_status_log.csv
 * @returns {Object} - Berechnete Statistiken
 */
export const calculateStatusStatistics = (statusData) => {
  // Wenn keine Daten vorhanden sind, leere Statistiken zurückgeben
  if (!statusData || statusData.length === 0) {
    return {
      latestStatus: null,
      startStatus: null,
      diffInput: 0,
      diffArchiv: 0,
      diffError: 0
    };
  }

  // Sortiere die Daten nach Zeitpunkt (neueste zuerst)
  const sortedData = [...statusData].sort((a, b) => 
    new Date(b.Zeitpunkt) - new Date(a.Zeitpunkt)
  );
  
  // Neuesten Status (Ende des Zeitraums) ermitteln
  let latestStatus = null;
  if (sortedData.length > 0) {
    // Kopiere den neuesten Eintrag
    latestStatus = { ...sortedData[0] };
    
    // Finde den korrekten Schlüssel für die Error-Spalte (mit oder ohne \r)
    const errorKey = Object.keys(latestStatus).find(key => key.startsWith('Error'));
    
    // Stelle sicher, dass Input, Archiv und Error als Zahlen vorhanden sind
    latestStatus.Input = parseInt(latestStatus.Input) || 0;
    latestStatus.Archiv = parseInt(latestStatus.Archiv) || 0;
    
    // Verwende den gefundenen Schlüssel, um den Error-Wert zu extrahieren
    if (errorKey) {
      // Extrahiere den Zahlenwert und entferne mögliche \r-Zeichen
      const errorValue = String(latestStatus[errorKey]).replace(/\r/g, '');
      latestStatus.Error = parseInt(errorValue) || 0;
    } else {
      latestStatus.Error = 0;
    }
  }
  
  // Ältesten Status (Anfang des Zeitraums) ermitteln
  let startStatus = null;
  if (sortedData.length > 0) {
    // Kopiere den ältesten Eintrag
    startStatus = { ...sortedData[sortedData.length - 1] };
    
    // Finde den korrekten Schlüssel für die Error-Spalte (mit oder ohne \r)
    const errorKey = Object.keys(startStatus).find(key => key.startsWith('Error'));
    
    // Stelle sicher, dass Input, Archiv und Error als Zahlen vorhanden sind
    startStatus.Input = parseInt(startStatus.Input) || 0;
    startStatus.Archiv = parseInt(startStatus.Archiv) || 0;
    
    // Verwende den gefundenen Schlüssel, um den Error-Wert zu extrahieren
    if (errorKey) {
      // Extrahiere den Zahlenwert und entferne mögliche \r-Zeichen
      const errorValue = String(startStatus[errorKey]).replace(/\r/g, '');
      startStatus.Error = parseInt(errorValue) || 0;
    } else {
      startStatus.Error = 0;
    }
  }
  
  // Differenzen berechnen
  const diffInput = latestStatus && startStatus ? latestStatus.Input - startStatus.Input : 0;
  const diffArchiv = latestStatus && startStatus ? latestStatus.Archiv - startStatus.Archiv : 0;
  const diffError = latestStatus && startStatus ? latestStatus.Error - startStatus.Error : 0;
  
  return {
    latestStatus,
    startStatus,
    diffInput,
    diffArchiv,
    diffError
  };
};

/**
 * Analysiert Muster-Übereinstimmungen
 * @param {Array} patternData - Daten aus der AFM_pattern_matches.csv
 * @returns {Object} - Analysierte Muster-Daten
 */
export const analyzePatternMatches = (patternData) => {
  // Muster nach Typ gruppieren
  const patternsByType = {};
  
  patternData.forEach(pattern => {
    const patternType = pattern.Muster || 'Unbekannt';
    
    if (!patternsByType[patternType]) {
      patternsByType[patternType] = [];
    }
    
    patternsByType[patternType].push(pattern);
  });
  
  // Anzahl der Muster pro Typ zählen
  const patternCounts = Object.keys(patternsByType).map(type => ({
    type,
    count: patternsByType[type].length,
    examples: patternsByType[type].slice(0, 3) // Beispiele für jeden Typ (max. 3)
  }));
  
  // Nach Anzahl sortieren (absteigend)
  patternCounts.sort((a, b) => b.count - a.count);
  
  return {
    patternsByType,
    patternCounts,
    totalPatterns: patternData.length
  };
};
