import React, { useState, useEffect, useCallback } from 'react';
import TimelineSlider from './TimelineSlider';

/**
 * FilterBar - Komponente zum Filtern der Daten nach Zeitraum
 * @param {Object} props - Komponenten-Props
 * @param {Function} props.onFilterChange - Callback-Funktion, die bei Änderung des Filters aufgerufen wird
 * @param {Date} props.minDate - Frühestes Datum in den Daten
 * @param {Date} props.maxDate - Spätestes Datum in den Daten
 * @param {Object} props.currentDateRange - Aktueller Datumsbereich aus der übergeordneten Komponente
 * @version 1.0.2 - Kompakte Buttons und Zeitfelder hinzugefügt
 */
const FilterBar = ({ onFilterChange, minDate, maxDate, currentDateRange }) => {
  // Formatiere Datum für Datumseingabefelder
  const formatDateForInput = useCallback((date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }, []);
  
  // Initialisiere lokale Zustände mit Werten aus currentDateRange
  const [localFilter, setLocalFilter] = useState({
    startDate: currentDateRange?.startDate ? formatDateForInput(currentDateRange.startDate) : '',
    endDate: currentDateRange?.endDate ? formatDateForInput(currentDateRange.endDate) : '',
    startTime: '00:00',
    endTime: '23:59',
    type: 'custom' // 'custom', 'min5', 'min15', 'hour1', 'hour4', 'hour8', 'hour12', 'lastDay', 'lastWeek', 'lastMonth'
  });
  
  // Initialisiere Filter beim ersten Laden, wenn keine Daten vorhanden sind
  useEffect(() => {
    console.log('useEffect: Initialisiere Filter');
    if ((!localFilter.startDate || !localFilter.endDate) && maxDate) {
      const today = new Date(maxDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      setLocalFilter(prev => ({
        ...prev,
        startDate: formatDateForInput(yesterday),
        endDate: formatDateForInput(today),
        type: 'lastDay'
      }));
      
      // Informiere die übergeordnete Komponente über die Änderung
      onFilterChange({
        startDate: yesterday,
        endDate: today
      });
    }
  }, [maxDate, localFilter.startDate, localFilter.endDate, formatDateForInput, onFilterChange]);
  
  // Synchronisiere mit dem übergeordneten Zustand, aber nur wenn sich dieser ändert
  // und nicht durch lokale Änderungen verursacht wurde
  useEffect(() => {
    if (currentDateRange?.startDate && currentDateRange?.endDate) {
      const formattedStart = formatDateForInput(currentDateRange.startDate);
      const formattedEnd = formatDateForInput(currentDateRange.endDate);
      
      // Nur aktualisieren, wenn sich die Werte tatsächlich geändert haben
      // und wenn der lokale Filtertyp weder 'custom' noch 'shifted' ist
      // (d.h. nicht vom Benutzer geändert oder durch Zeitraum-Verschiebung)
      if ((formattedStart !== localFilter.startDate || formattedEnd !== localFilter.endDate) && 
          localFilter.type !== 'custom' && localFilter.type !== 'shifted') {
        setLocalFilter(prev => ({
          ...prev,
          startDate: formattedStart,
          endDate: formattedEnd
        }));
      }
    }
  }, [currentDateRange, formatDateForInput, localFilter.startDate, localFilter.endDate, localFilter.type]);
  
  // Handler für Änderungen an den Datumseingabefeldern
  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Aktualisiere nur das geänderte Feld im lokalen Zustand
    setLocalFilter(prev => {
      const newFilter = { ...prev, type: 'custom' };
      if (name === 'startDate') newFilter.startDate = value;
      else if (name === 'endDate') newFilter.endDate = value;
      else if (name === 'startTime') newFilter.startTime = value;
      else if (name === 'endTime') newFilter.endTime = value;
      return newFilter;
    });
    
    // Warte auf die nächste Render-Phase, um sicherzustellen, dass der Zustand aktualisiert wurde
    requestAnimationFrame(() => {
      // Hole den aktuellen Zustand direkt aus dem DOM, um die neuesten Werte zu erhalten
      const currentStartDate = document.getElementById('startDate').value;
      const currentEndDate = document.getElementById('endDate').value;
      const currentStartTime = document.getElementById('startTime').value;
      const currentEndTime = document.getElementById('endTime').value;
      
      // Nur aktualisieren, wenn beide Daten vorhanden sind
      if (currentStartDate && currentEndDate) {
        try {
          // Erstelle neue Date-Objekte mit den aktuellen Werten
          const newStartDate = new Date(`${currentStartDate}T${currentStartTime || '00:00'}:00`);
          const newEndDate = new Date(`${currentEndDate}T${currentEndTime || '23:59'}:00`);
          
          // Validiere, dass die Daten gültig sind, bevor der Filter aktualisiert wird
          if (!isNaN(newStartDate) && !isNaN(newEndDate)) {
            // Benachrichtige die übergeordnete Komponente nur über die Änderung der Datumswerte
            onFilterChange({
              startDate: newStartDate,
              endDate: newEndDate
            });
          }
        } catch (error) {
          console.error('Fehler beim Konvertieren der Datumswerte:', error);
        }
      }
    });
  }, [localFilter, onFilterChange]);
  
  // Funktion zum Verschieben des Zeitraums um die aktuelle Zeitspanne
  const shiftTimeRange = useCallback((direction) => {
    // Direkte Manipulation ohne useEffect-Trigger
    // Aktuelle Start- und Enddaten aus dem lokalen Filter holen
    const currentStartDate = new Date(`${localFilter.startDate}T${localFilter.startTime || '00:00'}:00`);
    const currentEndDate = new Date(`${localFilter.endDate}T${localFilter.endTime || '23:59'}:00`);
    
    // Zeitdifferenz zwischen Start und Ende berechnen (in Millisekunden)
    const timeDifference = currentEndDate.getTime() - currentStartDate.getTime();
    
    // Neue Start- und Enddaten berechnen, je nach Richtung
    let newStartDate, newEndDate;
    
    if (direction === 'forward') {
      // Vorwärts: Beide Daten um die Zeitdifferenz erhöhen
      newStartDate = new Date(currentStartDate.getTime() + timeDifference);
      newEndDate = new Date(currentEndDate.getTime() + timeDifference);
      
      // Prüfen, ob das neue Enddatum nicht über das maxDate hinausgeht
      const maxDateObj = maxDate ? new Date(maxDate) : null;
      if (maxDateObj && newEndDate > maxDateObj) {
        // Wenn ja, dann auf maxDate begrenzen und Start entsprechend anpassen
        newEndDate = new Date(maxDateObj);
        newStartDate = new Date(newEndDate.getTime() - timeDifference);
      }
    } else {
      // Rückwärts: Beide Daten um die Zeitdifferenz verringern
      newStartDate = new Date(currentStartDate.getTime() - timeDifference);
      newEndDate = new Date(currentEndDate.getTime() - timeDifference);
      
      // Prüfen, ob das neue Startdatum nicht unter das minDate fällt
      const minDateObj = minDate ? new Date(minDate) : null;
      if (minDateObj && newStartDate < minDateObj) {
        // Wenn ja, dann auf minDate begrenzen und Ende entsprechend anpassen
        newStartDate = new Date(minDateObj);
        newEndDate = new Date(newStartDate.getTime() + timeDifference);
      }
    }
    
    // Formatiere die Daten für die Eingabefelder
    const formattedStartDate = formatDateForInput(newStartDate);
    const formattedEndDate = formatDateForInput(newEndDate);
    
    // Formatiere die Zeiten für die Eingabefelder
    const formattedStartTime = newStartDate.getHours().toString().padStart(2, '0') + ':' + 
                              newStartDate.getMinutes().toString().padStart(2, '0');
    const formattedEndTime = newEndDate.getHours().toString().padStart(2, '0') + ':' + 
                            newEndDate.getMinutes().toString().padStart(2, '0');
    
    // Direkt die übergeordnete Komponente informieren, ohne den lokalen Zustand zu ändern
    // Dies verhindert, dass der useEffect-Hook erneut ausgelöst wird
    onFilterChange({
      startDate: newStartDate,
      endDate: newEndDate
    });
    
    // Erst danach den lokalen Zustand aktualisieren
    // Wichtig: Wir setzen hier explizit einen Typ, der nicht 'custom' ist,
    // damit der useEffect-Hook nicht erneut ausgelöst wird
    setLocalFilter({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      type: 'shifted' // Spezieller Typ für verschobene Zeiträume
    });
  }, [localFilter, minDate, maxDate, formatDateForInput, onFilterChange]);

  // Handler für Änderungen am Filtertyp
  const handleFilterTypeChange = useCallback((type) => {
    if (!maxDate) return;
    
    let today = new Date(maxDate);
    let start = new Date(today);
    let startTime = '00:00';
    let endTime = '23:59';
    
    switch (type) {
      case 'min5':
        // Genaue Uhrzeit für kurze Zeiträume setzen
        start = new Date(today.getTime() - 5 * 60 * 1000); // 5 Minuten zurück
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = today.getHours().toString().padStart(2, '0') + ':' + 
                 today.getMinutes().toString().padStart(2, '0');
        break;
      case 'min15':
        start = new Date(today.getTime() - 15 * 60 * 1000); // 15 Minuten zurück
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = today.getHours().toString().padStart(2, '0') + ':' + 
                 today.getMinutes().toString().padStart(2, '0');
        break;
      case 'hour1':
        start = new Date(today.getTime() - 60 * 60 * 1000); // 1 Stunde zurück
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = today.getHours().toString().padStart(2, '0') + ':' + 
                 today.getMinutes().toString().padStart(2, '0');
        break;
      case 'hour4':
        start = new Date(today.getTime() - 4 * 60 * 60 * 1000); // 4 Stunden zurück
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = today.getHours().toString().padStart(2, '0') + ':' + 
                 today.getMinutes().toString().padStart(2, '0');
        break;
      case 'hour8':
        start = new Date(today.getTime() - 8 * 60 * 60 * 1000); // 8 Stunden zurück
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = today.getHours().toString().padStart(2, '0') + ':' + 
                 today.getMinutes().toString().padStart(2, '0');
        break;
      case 'hour12':
        start = new Date(today.getTime() - 12 * 60 * 60 * 1000); // 12 Stunden zurück
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = today.getHours().toString().padStart(2, '0') + ':' + 
                 today.getMinutes().toString().padStart(2, '0');
        break;
      case 'lastDay':
        // Exakt letzten 24 Stunden (gestern)
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Setze Start auf gestern mit gleicher Uhrzeit wie jetzt
        start = new Date(yesterday);
        
        // Aktualisiere End auf jetzt
        today = new Date(now);
        
        // Formatiere die Zeiten
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = now.getHours().toString().padStart(2, '0') + ':' + 
                 now.getMinutes().toString().padStart(2, '0');
        break;
      case 'lastWeek':
        // Exakt letzte 7 Tage (eine Woche)
        const nowWeek = new Date();
        const sevenDaysAgo = new Date(nowWeek);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Setze Start auf vor 7 Tagen mit gleicher Uhrzeit wie jetzt
        start = new Date(sevenDaysAgo);
        
        // Aktualisiere End auf jetzt
        today = new Date(nowWeek);
        
        // Formatiere die Zeiten
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = nowWeek.getHours().toString().padStart(2, '0') + ':' + 
                 nowWeek.getMinutes().toString().padStart(2, '0');
        break;
      case 'lastMonth':
        // Exakt letzte 30 Tage (ein Monat)
        const nowMonth = new Date();
        const thirtyDaysAgo = new Date(nowMonth);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Setze Start auf vor 30 Tagen mit gleicher Uhrzeit wie jetzt
        start = new Date(thirtyDaysAgo);
        
        // Aktualisiere End auf jetzt
        today = new Date(nowMonth);
        
        // Formatiere die Zeiten
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = nowMonth.getHours().toString().padStart(2, '0') + ':' + 
                 nowMonth.getMinutes().toString().padStart(2, '0');
        break;
      default:
        return; // Bei unbekanntem Typ nichts tun
    }
    
    const formattedStart = formatDateForInput(start);
    const formattedEnd = formatDateForInput(today);
    
    setLocalFilter({
      startDate: formattedStart,
      endDate: formattedEnd,
      startTime: startTime,
      endTime: endTime,
      type
    });
    
    // Erstelle vollständige Datums-/Zeitobjekte für den Filter
    const startDateTime = new Date(`${formattedStart}T${startTime}:00`);
    const endDateTime = new Date(`${formattedEnd}T${endTime}:00`);
    
    onFilterChange({
      startDate: startDateTime,
      endDate: endDateTime
    });
  }, [maxDate, formatDateForInput, onFilterChange]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      {/* Header mit Titel */}
      <div className="flex items-center space-x-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Zeitraum-Filter</h2>
      </div>
      
      {/* Hauptbereich für Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        
        <div className="flex flex-wrap gap-2">
          {/* Kompakte Zeitraum-Filter */}
          <button 
            onClick={() => handleFilterTypeChange('min5')}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              localFilter.type === 'min5' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            5m
          </button>
          <button 
            onClick={() => handleFilterTypeChange('min15')}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              localFilter.type === 'min15' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            15m
          </button>
          <button 
            onClick={() => handleFilterTypeChange('hour1')}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              localFilter.type === 'hour1' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            1h
          </button>
          <button 
            onClick={() => handleFilterTypeChange('hour4')}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              localFilter.type === 'hour4' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            4h
          </button>
          <button 
            onClick={() => handleFilterTypeChange('hour8')}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              localFilter.type === 'hour8' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            8h
          </button>
          <button 
            onClick={() => handleFilterTypeChange('hour12')}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              localFilter.type === 'hour12' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            12h
          </button>
          <button 
            onClick={() => handleFilterTypeChange('lastDay')}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              localFilter.type === 'lastDay' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            1d
          </button>
          <button 
            onClick={() => handleFilterTypeChange('lastWeek')}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              localFilter.type === 'lastWeek' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            7d
          </button>
          <button 
            onClick={() => handleFilterTypeChange('lastMonth')}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              localFilter.type === 'lastMonth' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            30d
          </button>
        </div>
        
        {/* Zeitraum-Verschiebungs-Buttons */}
        <div className="flex justify-center gap-4 mb-2">
          <button
            type="button"
            onClick={() => shiftTimeRange('backward')}
            className="flex items-center justify-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 rounded-md transition-colors duration-200 shadow-sm"
            title="Zeitraum rückwärts verschieben"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Zurück
          </button>
          <button
            type="button"
            onClick={() => shiftTimeRange('forward')}
            className="flex items-center justify-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 rounded-md transition-colors duration-200 shadow-sm"
            title="Zeitraum vorwärts verschieben"
          >
            Weiter
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl mx-auto">
          {/* Von-Datum - erste Zeile im Grid */}
          <div className="grid grid-cols-2 items-center">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 text-left">Von:</label>
            <div className="flex justify-end">
              <div className="w-32">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={localFilter.startDate}
                  onChange={handleDateChange}
                  className="w-full border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                  min={minDate ? formatDateForInput(new Date(minDate)) : ''}
                />
              </div>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={localFilter.startTime}
                onChange={handleDateChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 ml-1"
              />
            </div>
          </div>
          
          {/* Bis-Datum - zweite Zeile im Grid */}
          <div className="grid grid-cols-2 items-center">
            <label htmlFor="endDate" className="text-sm font-bold text-gray-700 dark:text-gray-300 text-left">Bis:</label>
            <div className="flex justify-end">
              <div className="w-32">
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={localFilter.endDate}
                  onChange={handleDateChange}
                  className="w-full border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                  max={maxDate ? formatDateForInput(new Date(maxDate)) : ''}
                />
              </div>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={localFilter.endTime}
                onChange={handleDateChange}
                className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 ml-1"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Zeitstrahl-Slider in eigener Zeile mit voller Breite */}
      <div className="w-full mt-2">
        <TimelineSlider 
          minDate={minDate ? new Date(minDate) : null}
          maxDate={maxDate ? new Date(maxDate) : null}
          currentRange={{
            startDate: localFilter.startDate && localFilter.startTime ? 
              new Date(`${localFilter.startDate}T${localFilter.startTime}:00`) : null,
            endDate: localFilter.endDate && localFilter.endTime ? 
              new Date(`${localFilter.endDate}T${localFilter.endTime}:00`) : null
          }}
          onRangeChange={(range) => {
            console.log('FilterBar - TimelineSlider hat Bereich geändert:', 
                      range.startDate.toLocaleString(), 
                      range.endDate.toLocaleString());
            
            // Formatiere die Daten für den lokalen Zustand
            const newStartDate = formatDateForInput(range.startDate);
            const newEndDate = formatDateForInput(range.endDate);
            const newStartTime = range.startDate.getHours().toString().padStart(2, '0') + ':' + 
                              range.startDate.getMinutes().toString().padStart(2, '0');
            const newEndTime = range.endDate.getHours().toString().padStart(2, '0') + ':' + 
                            range.endDate.getMinutes().toString().padStart(2, '0');
            
            console.log('FilterBar - Formatierte Werte:', 
                      newStartDate, newStartTime, 
                      newEndDate, newEndTime);
            
            // Aktualisiere den lokalen Zustand
            setLocalFilter(prev => {
              const updated = {
                ...prev,
                startDate: newStartDate,
                endDate: newEndDate,
                startTime: newStartTime,
                endTime: newEndTime,
                type: 'custom'
              };
              console.log('FilterBar - Neuer lokalFilter:', updated);
              return updated;
            });
            
            // Benachrichtige die übergeordnete Komponente
            console.log('FilterBar - Benachrichtige App-Komponente über Änderung');
            onFilterChange({
              startDate: range.startDate,
              endDate: range.endDate
            });
          }}
        />
      </div>
    </div>
  );
};

export default FilterBar;
