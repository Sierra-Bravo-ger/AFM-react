import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import TimelineSlider from './TimelineSlider';
import './FloatingTimelinePanel.css';

/**
 * Schwebendes, frei positionierbares Panel für den TimelineSlider und Zeitfilter
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.dateRange - Aktueller Datumsbereich
 * @param {Function} props.onDateRangeChange - Callback für Änderungen am Datumsbereich
 * @param {Date} props.minDate - Minimales Datum
 * @param {Date} props.maxDate - Maximales Datum
 */
const FloatingTimelinePanel = ({ dateRange, onDateRangeChange, minDate, maxDate }) => {
  // Berechne den Zeitraum in benutzerfreundlichem Format
  const timeRangeDuration = useMemo(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return '';
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffMs = end - start;
    
    // Berechne Tage, Stunden, Minuten
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Erstelle lesbaren String
    let result = '';
    if (days > 0) result += `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
    if (hours > 0) result += `${result ? ' ' : ''}${hours} Std.`;
    if (minutes > 0 || (!days && !hours)) result += `${result ? ' ' : ''}${minutes} Min.`;
    
    return result;
  }, [dateRange]);
  
  // State für Minimierung und Filter
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDateInputs, setShowDateInputs] = useState(false);
  
  // Formatiere Datum für Datumseingabefelder
  const formatDateForInput = useCallback((date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }, []);
  
  // Lokaler Filterzustand
  const [localFilter, setLocalFilter] = useState({
    startDate: dateRange?.startDate ? formatDateForInput(dateRange.startDate) : '',
    endDate: dateRange?.endDate ? formatDateForInput(dateRange.endDate) : '',
    startTime: dateRange?.startDate ? 
      dateRange.startDate.getHours().toString().padStart(2, '0') + ':' + 
      dateRange.startDate.getMinutes().toString().padStart(2, '0') : '00:00',
    endTime: dateRange?.endDate ? 
      dateRange.endDate.getHours().toString().padStart(2, '0') + ':' + 
      dateRange.endDate.getMinutes().toString().padStart(2, '0') : '23:59',
    type: 'custom'
  });
  
  // Funktion, um zu prüfen, ob ein bestimmter Filtertyp aktiv ist
  const isFilterActive = useCallback((type) => {
    return localFilter.type === type;
  }, [localFilter.type]);
  
  // Funktion zum Verschieben des Zeitraums um die aktuelle Zeitspanne
  const shiftTimeRange = useCallback((direction) => {
    // Verwende die aktuellen Datumsobjekte aus dem globalen Zustand für höchste Genauigkeit
    if (!dateRange?.startDate || !dateRange?.endDate) {
      console.warn('Zeitraum-Verschiebung nicht möglich: Kein gültiger Zeitraum vorhanden');
      return;
    }
    
    // Sichere Kopien der Date-Objekte erstellen
    const currentStartDate = new Date(dateRange.startDate.getTime());
    const currentEndDate = new Date(dateRange.endDate.getTime());
    
    // Zeitdifferenz zwischen Start und Ende berechnen (in Millisekunden)
    const timeDifference = currentEndDate.getTime() - currentStartDate.getTime();
    console.log(`Aktuelle Zeitspanne: ${timeDifference / (1000 * 60)} Minuten`);
    
    // Neue Start- und Enddaten berechnen, je nach Richtung
    let newStartDate, newEndDate;
    
    if (direction === 'forward') {
      // Vorwärts (in die Zukunft): Beide Daten um die Zeitdifferenz erhöhen
      newStartDate = new Date(currentStartDate.getTime() + timeDifference);
      newEndDate = new Date(currentEndDate.getTime() + timeDifference);
      console.log('Verschiebe in die Zukunft:', 
                 `${currentStartDate.toLocaleString()} -> ${newStartDate.toLocaleString()}`, 
                 `${currentEndDate.toLocaleString()} -> ${newEndDate.toLocaleString()}`);
      
      // Prüfen, ob das neue Enddatum nicht über das maxDate hinausgeht
      if (maxDate) {
        const maxDateObj = new Date(maxDate);
        if (newEndDate > maxDateObj) {
          // Wenn ja, dann auf maxDate begrenzen und Start entsprechend anpassen
          newEndDate = new Date(maxDateObj);
          newStartDate = new Date(newEndDate.getTime() - timeDifference);
          console.log('Begrenzung auf maxDate:', 
                     `Neues Ende: ${newEndDate.toLocaleString()}`, 
                     `Neuer Start: ${newStartDate.toLocaleString()}`);
        }
      }
    } else {
      // Rückwärts (in die Vergangenheit): Beide Daten um die Zeitdifferenz verringern
      newStartDate = new Date(currentStartDate.getTime() - timeDifference);
      newEndDate = new Date(currentEndDate.getTime() - timeDifference);
      console.log('Verschiebe in die Vergangenheit:', 
                 `${currentStartDate.toLocaleString()} -> ${newStartDate.toLocaleString()}`, 
                 `${currentEndDate.toLocaleString()} -> ${newEndDate.toLocaleString()}`);
      
      // Prüfen, ob das neue Startdatum nicht unter das minDate fällt
      if (minDate) {
        const minDateObj = new Date(minDate);
        if (newStartDate < minDateObj) {
          // Wenn ja, dann auf minDate begrenzen und Ende entsprechend anpassen
          newStartDate = new Date(minDateObj);
          newEndDate = new Date(newStartDate.getTime() + timeDifference);
          console.log('Begrenzung auf minDate:', 
                     `Neuer Start: ${newStartDate.toLocaleString()}`, 
                     `Neues Ende: ${newEndDate.toLocaleString()}`);
        }
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
    
    // Erst lokalen Zustand aktualisieren
    setLocalFilter({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      type: 'shifted' // Spezieller Typ für verschobene Zeiträume
    });
    
    // Dann die übergeordnete Komponente informieren
    onDateRangeChange({
      startDate: newStartDate,
      endDate: newEndDate
    });
  }, [dateRange, minDate, maxDate, formatDateForInput, onDateRangeChange]);
  
  // Referenz auf das Panel-Element
  const panelRef = useRef(null);
  const headerRef = useRef(null);
  
  // Drag-Funktionalität mit useEffect einrichten (Maus und Touch)
  useEffect(() => {
    const panel = panelRef.current;
    const header = headerRef.current;
    
    if (!panel || !header) return;
    
    let offsetX, offsetY, isDragging = false;
    
    // Gemeinsame Funktion für Maus und Touch zum Starten des Ziehens
    const startDrag = (clientX, clientY, target) => {
      // Nicht ziehen, wenn auf Steuerelemente geklickt wird
      if (target.closest('button')) return;
      
      isDragging = true;
      offsetX = clientX - panel.getBoundingClientRect().left;
      offsetY = clientY - panel.getBoundingClientRect().top;
      
      // Cursor und Opacity ändern
      panel.classList.add('dragging');
    };
    
    // Gemeinsame Funktion für Maus und Touch zum Bewegen
    const moveDrag = (clientX, clientY) => {
      if (!isDragging) return;
      
      const x = clientX - offsetX;
      const y = clientY - offsetY;
      
      // Grenzen des Viewports berücksichtigen
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      
      panel.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
      panel.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    };
    
    // Gemeinsame Funktion für Maus und Touch zum Beenden des Ziehens
    const endDrag = () => {
      if (isDragging) {
        isDragging = false;
        panel.classList.remove('dragging');
      }
    };
    
    // Maus-Event-Handler
    const onMouseDown = (e) => {
      startDrag(e.clientX, e.clientY, e.target);
      // Verhindern von Text-Selektion während des Ziehens
      e.preventDefault();
    };
    
    const onMouseMove = (e) => {
      moveDrag(e.clientX, e.clientY);
    };
    
    const onMouseUp = () => {
      endDrag();
    };
    
    // Touch-Event-Handler
    const onTouchStart = (e) => {
      // Nicht ziehen, wenn auf Steuerelemente geklickt wird
      if (e.target.closest('button') || e.target.closest('svg') || e.target.closest('path')) {
        return; // Erlaube normales Touch-Verhalten für Buttons
      }
      
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY, e.target);
        // Verhindern von Scrolling während des Ziehens, aber nur wenn wir nicht auf einem Button sind
        e.preventDefault();
      }
    };
    
    const onTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
        // Verhindern von Scrolling nur während des Ziehens
        e.preventDefault();
      }
    };
    
    const onTouchEnd = () => {
      endDrag();
    };
    
    // Event-Listener für Maus hinzufügen
    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // Event-Listener für Touch hinzufügen
    header.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
    
    // Stelle sicher, dass Buttons im Header Touch-Events empfangen können
    const buttons = header.querySelectorAll('button, svg, path');
    buttons.forEach(button => {
      button.addEventListener('touchstart', (e) => {
        // Stoppt die Propagation, damit der Header-Touch-Handler nicht ausgelöst wird
        e.stopPropagation();
      });
    });
    
    // Cleanup
    return () => {
      // Maus-Event-Listener entfernen
      header.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Touch-Event-Listener entfernen
      header.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
      
      // Button-Event-Listener entfernen
      const buttons = header.querySelectorAll('button, svg, path');
      buttons.forEach(button => {
        button.removeEventListener('touchstart', (e) => e.stopPropagation());
      });
    };
  }, []);
  
  // Minimieren/Maximieren-Handler
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Toggle für Datumseingabefelder
  const toggleDateInputs = () => {
    setShowDateInputs(!showDateInputs);
  };
  
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
            onDateRangeChange({
              startDate: newStartDate,
              endDate: newEndDate
            });
          }
        } catch (error) {
          console.error('Fehler beim Konvertieren der Datumswerte:', error);
        }
      }
    });
  }, [onDateRangeChange]);
  
  // Handler für Änderungen am Filtertyp (Schnellfilter)
  const handleFilterTypeChange = useCallback((type) => {
    if (!maxDate) return;
    
    let today = new Date(maxDate);
    let start = new Date(today);
    let startTime = '00:00';
    let endTime = '23:59';
    
    switch (type) {
      case 'min5':
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
      case 'hour16':
        start = new Date(today.getTime() - 16 * 60 * 60 * 1000); // 16 Stunden zurück
        startTime = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
        endTime = today.getHours().toString().padStart(2, '0') + ':' + 
                 today.getMinutes().toString().padStart(2, '0');
        break;
      case 'lastDay':
        start = new Date(today);
        start.setDate(start.getDate() - 1);
        break;
      case 'lastWeek':
        start = new Date(today);
        start.setDate(start.getDate() - 7);
        break;
      case 'twoWeeks':
        start = new Date(today);
        start.setDate(start.getDate() - 14);
        break;
      case 'lastMonth':
        start = new Date(today);
        start.setDate(start.getDate() - 30);
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
      type: type
    });
    
    onDateRangeChange({
      startDate: start,
      endDate: today
    });
  }, [maxDate, formatDateForInput, onDateRangeChange]);
  
  return (
    <div 
      ref={panelRef}
      className={`floating-panel fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 ${isMinimized ? 'w-48' : 'w-80'}`}
      style={{ 
        left: '20px', 
        top: '100px'
      }}
    >
      {/* Panel-Header mit Steuerungselementen */}
      <div ref={headerRef} className="panel-header flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-t-lg border-b border-gray-200 dark:border-gray-600 cursor-grab">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isMinimized ? 'Zeitfilter' : 'Zeitraum-Filter'}
          </h3>
          {!isMinimized && timeRangeDuration && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {timeRangeDuration}
            </p>
          )}
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={toggleMinimize}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
            title={isMinimized ? 'Maximieren' : 'Minimieren'}
            aria-expanded={!isMinimized}
            aria-label={isMinimized ? 'Maximieren' : 'Minimieren'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transform transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Minimierter Inhalt */}
      <div className={`p-2 ${isMinimized ? 'block' : 'hidden'}`}>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {dateRange?.startDate?.toLocaleDateString()} - {dateRange?.endDate?.toLocaleDateString()}
          <span className="mx-1 text-gray-500 dark:text-gray-500">({timeRangeDuration})</span>
          <button 
            onClick={toggleMinimize}
            className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Filter anpassen
          </button>
        </p>
      </div>
      
      {/* Panel-Inhalt */}
      <div className={`p-3 ${isMinimized ? 'hidden' : 'block'}`}>
        {/* Zeitraum-Verschiebungs-Buttons */}
        <div className="flex justify-between mb-2">
          <button
            onClick={() => shiftTimeRange('backward')}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors flex items-center"
            title="Zeitraum in die Vergangenheit verschieben"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Älter
          </button>
          <button
            onClick={() => shiftTimeRange('forward')}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors flex items-center"
            title="Zeitraum in die Zukunft verschieben"
          >
            Neuer
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Schnellfilter-Buttons */}
        <div className="flex flex-wrap gap-1 mb-2">
          <button 
            onClick={() => handleFilterTypeChange('min15')} 
            className={`text-xs px-2 py-1 ${isFilterActive('min15') 
              ? 'bg-blue-300 dark:bg-blue-600 border-2 border-blue-500 dark:border-blue-300 font-medium' 
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-transparent'} 
              text-blue-800 dark:text-blue-100 rounded-md transition-colors`}
          >
            15 Min
          </button>
          <button 
            onClick={() => handleFilterTypeChange('hour1')} 
            className={`text-xs px-2 py-1 ${isFilterActive('hour1') 
              ? 'bg-blue-300 dark:bg-blue-600 border-2 border-blue-500 dark:border-blue-300 font-medium' 
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-transparent'} 
              text-blue-800 dark:text-blue-100 rounded-md transition-colors`}
          >
            1 Std
          </button>
          <button 
            onClick={() => handleFilterTypeChange('hour4')} 
            className={`text-xs px-2 py-1 ${isFilterActive('hour4') 
              ? 'bg-blue-300 dark:bg-blue-600 border-2 border-blue-500 dark:border-blue-300 font-medium' 
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-transparent'} 
              text-blue-800 dark:text-blue-100 rounded-md transition-colors`}
          >
            4 Std
          </button>
          <button 
            onClick={() => handleFilterTypeChange('hour8')} 
            className={`text-xs px-2 py-1 ${isFilterActive('hour8') 
              ? 'bg-blue-300 dark:bg-blue-600 border-2 border-blue-500 dark:border-blue-300 font-medium' 
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-transparent'} 
              text-blue-800 dark:text-blue-100 rounded-md transition-colors`}
          >
            8 Std
          </button>
          <button 
            onClick={() => handleFilterTypeChange('hour16')} 
            className={`text-xs px-2 py-1 ${isFilterActive('hour16') 
              ? 'bg-blue-300 dark:bg-blue-600 border-2 border-blue-500 dark:border-blue-300 font-medium' 
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-transparent'} 
              text-blue-800 dark:text-blue-100 rounded-md transition-colors`}
          >
            16 Std
          </button>
          <button 
            onClick={() => handleFilterTypeChange('lastDay')} 
            className={`text-xs px-2 py-1 ${isFilterActive('lastDay') 
              ? 'bg-blue-300 dark:bg-blue-600 border-2 border-blue-500 dark:border-blue-300 font-medium' 
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-transparent'} 
              text-blue-800 dark:text-blue-100 rounded-md transition-colors`}
          >
            24 Std
          </button>
          <button 
            onClick={() => handleFilterTypeChange('lastWeek')} 
            className={`text-xs px-2 py-1 ${isFilterActive('lastWeek') 
              ? 'bg-blue-300 dark:bg-blue-600 border-2 border-blue-500 dark:border-blue-300 font-medium' 
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-transparent'} 
              text-blue-800 dark:text-blue-100 rounded-md transition-colors`}
          >
            7 Tage
          </button>
          <button 
            onClick={() => handleFilterTypeChange('twoWeeks')} 
            className={`text-xs px-2 py-1 ${isFilterActive('twoWeeks') 
              ? 'bg-blue-300 dark:bg-blue-600 border-2 border-blue-500 dark:border-blue-300 font-medium' 
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-transparent'} 
              text-blue-800 dark:text-blue-100 rounded-md transition-colors`}
          >
            14 Tage
          </button>
          <button 
            onClick={() => handleFilterTypeChange('lastMonth')} 
            className={`text-xs px-2 py-1 ${isFilterActive('lastMonth') 
              ? 'bg-blue-300 dark:bg-blue-600 border-2 border-blue-500 dark:border-blue-300 font-medium' 
              : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 border border-transparent'} 
              text-blue-800 dark:text-blue-100 rounded-md transition-colors`}
          >
            30 Tage
          </button>
          <button 
            onClick={toggleDateInputs} 
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors ml-auto"
          >
            {showDateInputs ? 'Schließen' : 'Datum...'}
          </button>
        </div>
        
        {/* Datums-/Zeiteingabe */}
        {showDateInputs && (
          <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            {/* Von-Datum */}
            <div className="grid grid-cols-2 items-center mb-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 text-left">Von:</label>
              <div className="flex justify-end">
                <div className="w-24">
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={localFilter.startDate}
                    onChange={handleDateChange}
                    className="w-full border rounded-md px-1 py-0.5 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                    min={minDate ? formatDateForInput(new Date(minDate)) : ''}
                  />
                </div>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={localFilter.startTime}
                  onChange={handleDateChange}
                  className="border rounded-md px-1 py-0.5 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 ml-1 w-16"
                />
              </div>
            </div>
            
            {/* Bis-Datum */}
            <div className="grid grid-cols-2 items-center">
              <label htmlFor="endDate" className="text-xs font-medium text-gray-700 dark:text-gray-300 text-left">Bis:</label>
              <div className="flex justify-end">
                <div className="w-24">
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={localFilter.endDate}
                    onChange={handleDateChange}
                    className="w-full border rounded-md px-1 py-0.5 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                    max={maxDate ? formatDateForInput(new Date(maxDate)) : ''}
                  />
                </div>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={localFilter.endTime}
                  onChange={handleDateChange}
                  className="border rounded-md px-1 py-0.5 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 ml-1 w-16"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* TimelineSlider */}
        <TimelineSlider 
          minDate={minDate ? new Date(minDate) : null}
          maxDate={maxDate ? new Date(maxDate) : null}
          currentRange={{
            startDate: dateRange?.startDate ? new Date(dateRange.startDate) : null,
            endDate: dateRange?.endDate ? new Date(dateRange.endDate) : null
          }}
          onRangeChange={(range) => {
            // Formatiere die Daten für den lokalen Zustand
            const newStartDate = formatDateForInput(range.startDate);
            const newEndDate = formatDateForInput(range.endDate);
            const newStartTime = range.startDate.getHours().toString().padStart(2, '0') + ':' + 
                              range.startDate.getMinutes().toString().padStart(2, '0');
            const newEndTime = range.endDate.getHours().toString().padStart(2, '0') + ':' + 
                            range.endDate.getMinutes().toString().padStart(2, '0');
            
            // Aktualisiere den lokalen Zustand
            setLocalFilter(prev => ({
              ...prev,
              startDate: newStartDate,
              endDate: newEndDate,
              startTime: newStartTime,
              endTime: newEndTime,
              type: 'custom'
            }));
            
            // Benachrichtige die übergeordnete Komponente
            onDateRangeChange({
              startDate: range.startDate,
              endDate: range.endDate
            });
          }}
        />
      </div>
    </div>
  );
};

export default FloatingTimelinePanel;
