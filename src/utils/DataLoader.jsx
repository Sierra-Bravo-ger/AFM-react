/**
 * DataLoader.jsx
 * Utility für das Laden von CSV-Dateien
 */

/**
 * Lädt CSV-Dateien und konvertiert sie in ein Array von Objekten
 * @param {string} filePath - Pfad zur CSV-Datei
 * @returns {Promise<Array>} - Array mit den CSV-Daten als Objekte
 */
export const loadCSVData = async (filePath) => {
  try {
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Fehler beim Laden der Datei: ${response.status}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Fehler beim Laden der CSV-Datei:', error);
    return [];
  }
};

/**
 * Normalisiert Strings mit Encoding-Problemen
 * @param {string} text - Text mit möglichen Encoding-Problemen
 * @returns {string} - Normalisierter Text
 */
const normalizeText = (text) => {
  // Bekannte Encoding-Probleme beheben
  return text
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã¶/g, 'ö')
    .replace(/ÃŸ/g, 'ß')
    .replace(/Ã„/g, 'Ä')
    .replace(/Ã–/g, 'Ö')
    .replace(/Ãœ/g, 'Ü');
};

/**
 * Konvertiert CSV-Text in ein Array von Objekten
 * @param {string} csvText - CSV-Text mit Semikolon als Trennzeichen
 * @returns {Array} - Array mit den CSV-Daten als Objekte
 */
export const parseCSV = (csvText) => {
  // Zeilen aufteilen
  const lines = csvText.split('\n');
  
  // Überprüfen, ob Daten vorhanden sind
  if (lines.length === 0) return [];
  
  // Header extrahieren (erste Zeile)
  const headers = lines[0].split(';');
  
  // Daten verarbeiten (alle Zeilen außer der ersten)
  return lines.slice(1)
    .filter(line => line.trim() !== '') // Leere Zeilen entfernen
    .map(line => {
      const values = line.split(';');
      const entry = {};
      
      headers.forEach((header, index) => {
        // Wert normalisieren, um Encoding-Probleme zu beheben
        const value = values[index] || '';
        entry[header] = normalizeText(value);
      });
      
      return entry;
    });
};
