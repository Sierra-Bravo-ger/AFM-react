/**
 * Utility-Funktionen für die Verarbeitung von Fehlertypen
 */

/**
 * Normalisiert einen Fehlertyp (behebt Probleme mit Umlauten und Varianten)
 * @param {string} type - Der zu normalisierende Fehlertyp
 * @returns {string} - Der normalisierte Fehlertyp
 */
export const normalizeErrorType = (type) => {
  if (!type) return 'Unbekannt';
  
  // Bekannte Probleme mit Umlauten beheben
  const normalizedType = type
    .replace(/ZeitÃ¼berschreitung/g, 'Zeitüberschreitung')
    .replace(/Verbindung von peer/g, 'Verbindung von Peer');
  
  return normalizedType || 'Unbekannt';
};

/**
 * Kategorisiert einen Fehlertyp nach Schweregrad
 * @param {string} errorType - Der zu kategorisierende Fehlertyp
 * @returns {string} - Die Kategorie ('critical', 'warning', oder 'info')
 */
export const categorizeErrorType = (errorType) => {
  if (errorType.includes('deadlock') || 
      errorType.includes('Timeout') || 
      errorType.includes('Zeitüberschreitung') ||
      errorType.includes('lock conflict')) {
    return 'critical';
  } else if (errorType.includes('multiple') || 
            errorType.includes('Verbindung')) {
    return 'warning';
  } else {
    return 'info';
  }
};

/**
 * Farbpalette für Fehlertypen mit Hex-Codes und Tailwind-Klassen
 */
export const ERROR_TYPE_COLORS = {
  // Kritische Fehler (Rot/Pink/Orange)
  'Zeitüberschreitung': { hex: '#FF6B81', bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100', dark: 'dark:bg-red-900/30' },
  'Timeout': { hex: '#36A2EB', bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100', dark: 'dark:bg-blue-900/30' },
  'deadlock': { hex: '#FF9F40', bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100', dark: 'dark:bg-orange-900/30' },
  'lock conflict': { hex: '#9966FF', bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100', dark: 'dark:bg-purple-900/30' },
  
  // Warnungen (Gelb/Amber)
  'Verbindung von Peer': { hex: '#FF6384', bg: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-100', dark: 'dark:bg-pink-900/30' },
  'multiple Rows': { hex: '#FFCD56', bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-100', dark: 'dark:bg-amber-900/30' },
  
  // Informationen (Blau/Grün)
  'nicht definiert': { hex: '#4BC0C0', bg: 'bg-teal-500', text: 'text-teal-700', light: 'bg-teal-100', dark: 'dark:bg-teal-900/30' },
  'Fehlerhafte Antwort': { hex: '#EC4899', bg: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-100', dark: 'dark:bg-pink-900/30' },
  'Verbindungsfehler': { hex: '#F43F5E', bg: 'bg-rose-500', text: 'text-rose-700', light: 'bg-rose-100', dark: 'dark:bg-rose-900/30' },
  
  // Sonstige
  'Unbekannt': { hex: '#6B7280', bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100', dark: 'dark:bg-gray-900/30' },
  'Andere': { hex: '#9CA3AF', bg: 'bg-gray-400', text: 'text-gray-600', light: 'bg-gray-50', dark: 'dark:bg-gray-800/30' },
  'default': { hex: '#3B82F6', bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100', dark: 'dark:bg-blue-900/30' }
};

/**
 * Gibt eine Farbe für einen Fehlertyp zurück
 * @param {string} errorType - Der Fehlertyp
 * @param {string} format - Das Format der Rückgabe ('hex', 'bg', 'text', 'light', 'dark')
 * @returns {string} - Der Farbcode oder die Tailwind-Klasse für den Fehlertyp
 */
export const getErrorTypeColor = (errorType, format = 'hex') => {
  const colorSet = ERROR_TYPE_COLORS[errorType] || ERROR_TYPE_COLORS['default'];
  return colorSet[format] || colorSet.hex;
};

/**
 * Extrahiert den Fehlertyp aus einem Fehlerdatensatz
 * @param {Object} error - Der Fehlerdatensatz
 * @param {string} source - Die Datenquelle ('error_log' oder 'pattern_matches')
 * @returns {string} - Der normalisierte Fehlertyp
 */
export const extractErrorType = (error, source) => {
  if (!error) return 'Unbekannt';
  
  let errorType;
  if (source === 'error_log') {
    errorType = error.Fehlermeldung;
  } else if (source === 'pattern_matches') {
    errorType = error.Muster;
  } else {
    errorType = error.Fehlermeldung || error.Muster;
  }
  
  return normalizeErrorType(errorType);
};
