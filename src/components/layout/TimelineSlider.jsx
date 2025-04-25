import React, { useState, useEffect, useRef } from 'react';

/**
 * TimelineSlider - Komponente für einen visuellen Zeitstrahl mit Slidern
 * @param {Object} props - Komponenten-Props
 * @param {Date} props.minDate - Frühestes Datum in den Daten
 * @param {Date} props.maxDate - Spätestes Datum in den Daten
 * @param {Object} props.currentRange - Aktueller Datumsbereich {startDate, endDate}
 * @param {Function} props.onRangeChange - Callback-Funktion, die bei Änderung des Bereichs aufgerufen wird
 */
const TimelineSlider = ({ currentRange, onRangeChange, minDate, maxDate }) => {
  const timelineRef = useRef(null);
  const startHandleRef = useRef(null);
  const endHandleRef = useRef(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [dragging, setDragging] = useState(null); // 'start', 'end', oder null
  
  // Zustände für Hover-Effekte
  const [hoverPosition, setHoverPosition] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  
  // Zustände für die Positionen der Handles
  const [startHandlePos, setStartHandlePos] = useState(0);
  const [endHandlePos, setEndHandlePos] = useState(100);
  
  // Aktualisiere die Breite des Zeitstrahls beim Laden und bei Größenänderungen
  useEffect(() => {
    const updateTimelineWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth);
      }
    };
    
    updateTimelineWidth();
    window.addEventListener('resize', updateTimelineWidth);
    
    return () => {
      window.removeEventListener('resize', updateTimelineWidth);
    };
  }, []);
  
  // Berechne die Position auf dem Zeitstrahl basierend auf einem Datum
  const dateToPosition = (date) => {
    if (!date || !minDate || !maxDate) return 0;
    
    const totalRange = maxDate.getTime() - minDate.getTime();
    if (totalRange <= 0) return 0;
    
    const datePosition = date.getTime() - minDate.getTime();
    return Math.max(0, Math.min(timelineWidth, (datePosition / totalRange) * timelineWidth));
  };
  
  // Berechne das Datum basierend auf einer Position auf dem Zeitstrahl
  const positionToDate = (position) => {
    if (timelineWidth <= 0 || !minDate || !maxDate) return new Date();
    
    const percent = Math.max(0, Math.min(1, position / timelineWidth));
    const totalRange = maxDate.getTime() - minDate.getTime();
    const timestamp = minDate.getTime() + percent * totalRange;
    
    return new Date(timestamp);
  };
  
  // Formatiere Datum für die Anzeige
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleString('de-DE', options);
  };
  
  // Initialisiere die Handle-Positionen, wenn sich currentRange ändert
  // Dies ist bereits in der anderen useEffect-Funktion implementiert
  
  // Aktualisiere die Positionen, wenn sich currentRange ändert
  useEffect(() => {
    // Verhindere Aktualisierung während des Ziehens oder wenn das Flag gesetzt ist
    if (!dragging && !preventUpdateRef.current && timelineWidth > 0) {
      console.log('TimelineSlider - Aktualisiere Positionen von currentRange');
      if (currentRange?.startDate && minDate && maxDate) {
        const totalRange = maxDate.getTime() - minDate.getTime();
        if (totalRange > 0) {
          const startPos = ((currentRange.startDate.getTime() - minDate.getTime()) / totalRange) * timelineWidth;
          setStartHandlePos(Math.max(0, Math.min(timelineWidth - 10, startPos)));
        }
      }
      
      if (currentRange?.endDate && minDate && maxDate) {
        const totalRange = maxDate.getTime() - minDate.getTime();
        if (totalRange > 0) {
          const endPos = ((currentRange.endDate.getTime() - minDate.getTime()) / totalRange) * timelineWidth;
          setEndHandlePos(Math.max(10, Math.min(timelineWidth, endPos)));
        }
      }
    } else if (dragging || preventUpdateRef.current) {
      console.log('TimelineSlider - Ignoriere currentRange-Änderung während des Ziehens oder nach dem Loslassen');
    }
  }, [currentRange, minDate, maxDate, timelineWidth, dragging]);
  
  // Debug-Logging für alle wichtigen Zustandsänderungen
  useEffect(() => {
    console.log('TimelineSlider - currentRange geändert:', 
              currentRange?.startDate?.toLocaleString(), 
              currentRange?.endDate?.toLocaleString());
  }, [currentRange]);
  
  useEffect(() => {
    console.log('TimelineSlider - Handle-Positionen geändert:', 
              { start: startHandlePos, end: endHandlePos });
  }, [startHandlePos, endHandlePos]);
  
  useEffect(() => {
    console.log('TimelineSlider - Dragging-Status:', dragging);
  }, [dragging]);
  
  // Handler für Mausbewegungen über dem Zeitstrahl
  const handleMouseMove = (e) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const position = e.clientX - rect.left;
    
    setHoverPosition(position);
    setHoverDate(positionToDate(position));
  };
  
  // Flag, um zu verhindern, dass der Slider nach dem Loslassen zurückspringt
  const preventUpdateRef = useRef(false);
  
  // Handler für das Drücken der Maus auf den Bereich zwischen den Handles
  const handleRangeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Setze den Dragging-Status, der auch den Cursor-Stil beeinflusst
    setDragging('range');
    
    // Setze das Flag, um zu verhindern, dass der Slider nach dem Loslassen zurückspringt
    preventUpdateRef.current = true;
    
    // Startposition für das Ziehen merken
    const startX = e.clientX;
    const initialStartPos = startHandlePos;
    const initialEndPos = endHandlePos;
    const rangeWidth = initialEndPos - initialStartPos;
    
    // Globaler Mausbewegungshandler für das Ziehen
    const handleGlobalMouseMove = (moveEvent) => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const deltaX = moveEvent.clientX - startX;
      
      // Berechne neue Positionen für beide Handles
      let newStartPos = initialStartPos + deltaX;
      let newEndPos = initialEndPos + deltaX;
      
      // Stelle sicher, dass die Positionen im gültigen Bereich liegen
      if (newStartPos < 0) {
        newStartPos = 0;
        newEndPos = rangeWidth;
      }
      
      if (newEndPos > rect.width) {
        newEndPos = rect.width;
        newStartPos = newEndPos - rangeWidth;
      }
      
      // Aktualisiere die Positionen
      setStartHandlePos(newStartPos);
      setEndHandlePos(newEndPos);
    };
    
    // Handler für das Loslassen der Maus
    const handleGlobalMouseUp = () => {
      // Entferne die globalen Event-Listener
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      
      document.body.style.cursor = 'default';
      
      // Berechne die neuen Datumswerte basierend auf den Handle-Positionen
      if (timelineWidth > 0 && minDate && maxDate) {
        const totalRange = maxDate.getTime() - minDate.getTime();
        
        // Berechne die Prozentpositionen
        const startPercent = startHandlePos / timelineWidth;
        const endPercent = endHandlePos / timelineWidth;
        
        // Berechne die neuen Datumswerte
        const newStartDate = new Date(minDate.getTime() + startPercent * totalRange);
        const newEndDate = new Date(minDate.getTime() + endPercent * totalRange);
        
        console.log('TimelineSlider - Sende neue Datumswerte (Range-Drag):', 
                  newStartDate.toLocaleString(), 
                  newEndDate.toLocaleString(),
                  'von Positionen:', startHandlePos, endHandlePos);
        
        // Benachrichtige die übergeordnete Komponente
        onRangeChange({
          startDate: newStartDate,
          endDate: newEndDate
        });
        
        // Setze das Flag nach einer Verzögerung zurück, um zukünftige Updates zu ermöglichen
        setTimeout(() => {
          preventUpdateRef.current = false;
        }, 100);
      }
      
      setDragging(null);
    };
    
    // Touch-Handler für Bewegung
    const handleGlobalTouchMove = (touchEvent) => {
      if (!timelineRef.current || !touchEvent.touches[0]) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const touchX = touchEvent.touches[0].clientX;
      const deltaX = touchX - startX;
      
      // Berechne neue Positionen für beide Handles
      let newStartPos = initialStartPos + deltaX;
      let newEndPos = initialEndPos + deltaX;
      
      // Stelle sicher, dass die Positionen im gültigen Bereich liegen
      if (newStartPos < 0) {
        newStartPos = 0;
        newEndPos = rangeWidth;
      }
      
      if (newEndPos > rect.width) {
        newEndPos = rect.width;
        newStartPos = newEndPos - rangeWidth;
      }
      
      // Aktualisiere die Positionen
      setStartHandlePos(newStartPos);
      setEndHandlePos(newEndPos);
      
      // Verhindere Standard-Touch-Verhalten wie Scrollen
      touchEvent.preventDefault();
    };
    
    // Touch-Handler für das Ende des Touches
    const handleGlobalTouchEnd = handleGlobalMouseUp;
    
    // Füge globale Event-Listener hinzu
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp, { once: true });
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd, { once: true });
  };
  
  // Touch-Handler für den Bereich zwischen den Handles
  const handleRangeTouchStart = (e) => {
    if (!e.touches[0]) return;
    
    // Verhindere Standard-Touch-Aktionen
    e.stopPropagation();
    
    // Setze den Dragging-Status
    setDragging('range');
    
    // Setze das Flag, um zu verhindern, dass der Slider nach dem Loslassen zurückspringt
    preventUpdateRef.current = true;
    
    // Startposition für das Ziehen merken
    const startX = e.touches[0].clientX;
    const initialStartPos = startHandlePos;
    const initialEndPos = endHandlePos;
    const rangeWidth = initialEndPos - initialStartPos;
    
    // Verhindern, dass der Bildschirm scrollt während des Ziehens
    document.body.style.overflow = 'hidden';
    
    // Touch-Handler für Bewegung
    const handleGlobalTouchMove = (touchEvent) => {
      if (!timelineRef.current || !touchEvent.touches[0]) return;
      
      // Verhindere Standard-Touch-Aktionen während der Bewegung
      touchEvent.stopPropagation();
      
      const rect = timelineRef.current.getBoundingClientRect();
      const touchX = touchEvent.touches[0].clientX;
      const deltaX = touchX - startX;
      
      // Berechne neue Positionen für beide Handles
      let newStartPos = initialStartPos + deltaX;
      let newEndPos = initialEndPos + deltaX;
      
      // Stelle sicher, dass die Positionen im gültigen Bereich liegen
      if (newStartPos < 0) {
        newStartPos = 0;
        newEndPos = rangeWidth;
      }
      
      if (newEndPos > rect.width) {
        newEndPos = rect.width;
        newStartPos = newEndPos - rangeWidth;
      }
      
      // Aktualisiere die Positionen
      setStartHandlePos(newStartPos);
      setEndHandlePos(newEndPos);
    };
    
    // Touch-Handler für das Ende des Touches
    const handleGlobalTouchEnd = () => {
      // Entferne die globalen Event-Listener
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
      
      // Erlaube Scrollen wieder
      document.body.style.overflow = '';
      
      // Berechne die neuen Datumswerte basierend auf den Handle-Positionen
      if (timelineWidth > 0 && minDate && maxDate) {
        const totalRange = maxDate.getTime() - minDate.getTime();
        
        // Berechne die Prozentpositionen
        const startPercent = startHandlePos / timelineWidth;
        const endPercent = endHandlePos / timelineWidth;
        
        // Berechne die neuen Datumswerte
        const newStartDate = new Date(minDate.getTime() + startPercent * totalRange);
        const newEndDate = new Date(minDate.getTime() + endPercent * totalRange);
        
        console.log('TimelineSlider - Sende neue Datumswerte (Range-Touch):', 
                  newStartDate.toLocaleString(), 
                  newEndDate.toLocaleString(),
                  'von Positionen:', startHandlePos, endHandlePos);
        
        // Benachrichtige die übergeordnete Komponente
        onRangeChange({
          startDate: newStartDate,
          endDate: newEndDate
        });
        
        // Setze das Flag nach einer Verzögerung zurück, um zukünftige Updates zu ermöglichen
        setTimeout(() => {
          preventUpdateRef.current = false;
        }, 200); // Längere Verzögerung für stabilere Touch-Interaktion
      }
      
      // Setze den Dragging-Status zurück
      setDragging(null);
    };
    
    // Füge globale Event-Listener hinzu
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    document.addEventListener('touchend', handleGlobalTouchEnd, { once: true });
    document.addEventListener('touchcancel', handleGlobalTouchEnd, { once: true }); // Wichtig für abgebrochene Touch-Events
  };
  
  // Handler für das Drücken der Maus auf einen Slider
  const handleSliderMouseDown = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Setze den Dragging-Status
    setDragging(type);
    
    // Setze das Flag, um zu verhindern, dass der Slider nach dem Loslassen zurückspringt
    preventUpdateRef.current = true;
    
    // Startposition für das Ziehen merken
    const startX = e.clientX;
    const initialStartPos = startHandlePos;
    const initialEndPos = endHandlePos;
    
    // Globaler Mausbewegungshandler für das Ziehen
    const handleGlobalMouseMove = (moveEvent) => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const deltaX = moveEvent.clientX - startX;
      
      if (type === 'start') {
        // Berechne neue Position und stelle sicher, dass sie im gültigen Bereich liegt
        // Mindestabstand von 8px zwischen den Handles (statt 10px) wegen der schlankeren Handles
        const newPos = Math.max(0, Math.min(endHandlePos - 8, initialStartPos + deltaX));
        setStartHandlePos(newPos);
      } else if (type === 'end') {
        // Berechne neue Position und stelle sicher, dass sie im gültigen Bereich liegt
        const newPos = Math.max(startHandlePos + 8, Math.min(rect.width, initialEndPos + deltaX));
        setEndHandlePos(newPos);
      }
    };
    
    // Touch-Handler für Bewegung
    const handleGlobalTouchMove = (touchEvent) => {
      if (!timelineRef.current || !touchEvent.touches[0]) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const touchX = touchEvent.touches[0].clientX;
      const deltaX = touchX - startX;
      
      if (type === 'start') {
        // Berechne neue Position und stelle sicher, dass sie im gültigen Bereich liegt
        // Mindestabstand von 8px zwischen den Handles (statt 10px) wegen der schlankeren Handles
        const newPos = Math.max(0, Math.min(endHandlePos - 8, initialStartPos + deltaX));
        setStartHandlePos(newPos);
      } else if (type === 'end') {
        // Berechne neue Position und stelle sicher, dass sie im gültigen Bereich liegt
        const newPos = Math.max(startHandlePos + 8, Math.min(rect.width, initialEndPos + deltaX));
        setEndHandlePos(newPos);
      }
      
      // Verhindere Standard-Touch-Verhalten wie Scrollen
      touchEvent.preventDefault();
    };
    
    // Handler für das Loslassen der Maus
    const handleGlobalMouseUp = () => {
      // Entferne die globalen Event-Listener
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      
      document.body.style.cursor = 'default';
      
      // Berechne die neuen Datumswerte basierend auf den Handle-Positionen
      if (timelineWidth > 0 && minDate && maxDate) {
        const totalRange = maxDate.getTime() - minDate.getTime();
        
        // Berechne die Prozentpositionen
        const startPercent = startHandlePos / timelineWidth;
        const endPercent = endHandlePos / timelineWidth;
        
        // Berechne die neuen Datumswerte
        const newStartDate = new Date(minDate.getTime() + startPercent * totalRange);
        const newEndDate = new Date(minDate.getTime() + endPercent * totalRange);
        
        console.log('TimelineSlider - Sende neue Datumswerte:', 
                  newStartDate.toLocaleString(), 
                  newEndDate.toLocaleString(),
                  'von Positionen:', startHandlePos, endHandlePos);
        
        // Benachrichtige die übergeordnete Komponente
        onRangeChange({
          startDate: newStartDate,
          endDate: newEndDate
        });
        
        // Setze das Flag nach einer Verzögerung zurück, um zukünftige Updates zu ermöglichen
        setTimeout(() => {
          preventUpdateRef.current = false;
        }, 100);
      }
      
      setDragging(null);
    };
    
    // Touch-Handler für das Ende des Touches
    const handleGlobalTouchEnd = handleGlobalMouseUp;
    
    // Füge globale Event-Listener hinzu
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp, { once: true });
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd, { once: true });
  };
  
  // Touch-Handler für die Slider-Handles
  const handleSliderTouchStart = (type, e) => {
    if (!e.touches[0]) return;
    
    // Verhindere Standard-Touch-Aktionen
    e.stopPropagation();
    
    // Setze den Dragging-Status
    setDragging(type);
    
    // Setze das Flag, um zu verhindern, dass der Slider nach dem Loslassen zurückspringt
    preventUpdateRef.current = true;
    
    // Startposition für das Ziehen merken
    const startX = e.touches[0].clientX;
    const initialStartPos = startHandlePos;
    const initialEndPos = endHandlePos;
    
    // Verhindern, dass der Bildschirm scrollt während des Ziehens
    document.body.style.overflow = 'hidden';
    
    // Touch-Handler für Bewegung
    const handleGlobalTouchMove = (touchEvent) => {
      if (!timelineRef.current || !touchEvent.touches[0]) return;
      
      // Verhindere Standard-Touch-Aktionen während der Bewegung
      touchEvent.stopPropagation();
      
      const rect = timelineRef.current.getBoundingClientRect();
      const touchX = touchEvent.touches[0].clientX;
      const deltaX = touchX - startX;
      
      if (type === 'start') {
        // Berechne neue Position und stelle sicher, dass sie im gültigen Bereich liegt
        // Mindestabstand von 8px zwischen den Handles (statt 10px) wegen der schlankeren Handles
        const newPos = Math.max(0, Math.min(endHandlePos - 8, initialStartPos + deltaX));
        setStartHandlePos(newPos);
      } else if (type === 'end') {
        // Berechne neue Position und stelle sicher, dass sie im gültigen Bereich liegt
        const newPos = Math.max(startHandlePos + 8, Math.min(rect.width, initialEndPos + deltaX));
        setEndHandlePos(newPos);
      }
    };
    
    // Touch-Handler für das Ende des Touches
    const handleGlobalTouchEnd = () => {
      // Entferne die globalen Event-Listener
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
      
      // Erlaube Scrollen wieder
      document.body.style.overflow = '';
      
      // Berechne die neuen Datumswerte basierend auf den Handle-Positionen
      if (timelineWidth > 0 && minDate && maxDate) {
        const totalRange = maxDate.getTime() - minDate.getTime();
        
        // Berechne die Prozentpositionen
        const startPercent = startHandlePos / timelineWidth;
        const endPercent = endHandlePos / timelineWidth;
        
        // Berechne die neuen Datumswerte
        const newStartDate = new Date(minDate.getTime() + startPercent * totalRange);
        const newEndDate = new Date(minDate.getTime() + endPercent * totalRange);
        
        console.log('TimelineSlider - Sende neue Datumswerte (Handle-Touch):', 
                  newStartDate.toLocaleString(), 
                  newEndDate.toLocaleString(),
                  'von Positionen:', startHandlePos, endHandlePos);
        
        // Benachrichtige die übergeordnete Komponente
        onRangeChange({
          startDate: newStartDate,
          endDate: newEndDate
        });
        
        // Setze das Flag nach einer Verzögerung zurück, um zukünftige Updates zu ermöglichen
        setTimeout(() => {
          preventUpdateRef.current = false;
        }, 200); // Längere Verzögerung für stabilere Touch-Interaktion
      }
      
      // Setze den Dragging-Status zurück
      setDragging(null);
    };
    
    // Füge globale Event-Listener hinzu
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    document.addEventListener('touchend', handleGlobalTouchEnd, { once: true });
    document.addEventListener('touchcancel', handleGlobalTouchEnd, { once: true }); // Wichtig für abgebrochene Touch-Events
  };
  
  // Handler für das Verlassen des Zeitstrahls
  const handleMouseLeave = () => {
    setHoverPosition(null);
    setHoverDate(null);
    
    // Wenn wir nicht ziehen, setze den Cursor zurück
    if (!dragging) {
      document.body.style.cursor = 'default';
    }
  };
  
  // Verwende die berechneten Positionen für die Slider
  const startPosition = startHandlePos;
  const endPosition = endHandlePos;
  
  // Generiere Zeitmarker für den Zeitstrahl
  const generateTimeMarkers = () => {
    if (!minDate || !maxDate || !timelineWidth) return [];
    
    const totalDuration = maxDate.getTime() - minDate.getTime();
    const markers = [];
    
    // Bestimme den Abstand zwischen den Markern basierend auf der Gesamtdauer und Bildschirmbreite
    let step;
    let skipFactor = 1; // Faktor zum Überspringen von Markern bei kleinen Bildschirmen
    
    // Bestimme Schrittgröße basierend auf Zeitraum
    if (totalDuration <= 24 * 60 * 60 * 1000) { // Weniger als 1 Tag
      step = 60 * 60 * 1000; // 1 Stunde
    } else if (totalDuration <= 7 * 24 * 60 * 60 * 1000) { // Weniger als 1 Woche
      step = 6 * 60 * 60 * 1000; // 6 Stunden
    } else if (totalDuration <= 30 * 24 * 60 * 60 * 1000) { // Weniger als 1 Monat
      step = 24 * 60 * 60 * 1000; // 1 Tag
    } else {
      step = 7 * 24 * 60 * 60 * 1000; // 1 Woche
    }
    
    // Passe die Markerdichte basierend auf der Bildschirmbreite an
    if (timelineWidth < 400) {
      skipFactor = 3; // Zeige nur jeden dritten Marker auf kleinen Bildschirmen
    } else if (timelineWidth < 600) {
      skipFactor = 2; // Zeige nur jeden zweiten Marker auf mittleren Bildschirmen
    }
    
    // Berechne, wie viele Marker wir insgesamt haben würden
    const totalMarkers = Math.ceil((maxDate.getTime() - minDate.getTime()) / step);
    
    // Erzeuge die Marker
    let markerCount = 0;
    for (let time = minDate.getTime(); time <= maxDate.getTime(); time += step) {
      // Überspringe Marker basierend auf skipFactor
      if (markerCount % skipFactor !== 0 && time !== minDate.getTime() && time !== maxDate.getTime()) {
        markerCount++;
        continue;
      }
      
      const date = new Date(time);
      const position = dateToPosition(date);
      
      // Formatiere das Datum für die Anzeige
      let label;
      if (step >= 24 * 60 * 60 * 1000) {
        // Tage oder Wochen: Zeige nur Datum
        label = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      } else {
        // Stunden: Zeige nur Uhrzeit
        label = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      }
      
      markers.push({ position, label, date });
      markerCount++;
    }
    
    return markers;
  };
  
  const markers = generateTimeMarkers();
  
  return (
    <div className="mt-4 relative select-none">
      {/* Zeitstrahl */}
      <div 
        ref={timelineRef}
        className="h-8 bg-gray-200 dark:bg-gray-700 relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ausgewählter Bereich - jetzt draggable und touch-fähig */}
        <div 
          className={`absolute h-full bg-blue-200 dark:bg-blue-800/40 hover:bg-blue-300 dark:hover:bg-blue-700/50 ${dragging === 'range' ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ left: startPosition, width: `${endPosition - startPosition}px` }}
          onMouseDown={(e) => handleRangeMouseDown(e)}
          onTouchStart={(e) => handleRangeTouchStart(e)}
        />
        
        {/* Zeitmarker */}
        {markers.map((marker, index) => (
          <div 
            key={index}
            className="absolute h-3 border-l border-gray-400 dark:border-gray-500"
            style={{ left: marker.position, pointerEvents: 'none' }}
          >
            <span className="absolute -ml-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
              {marker.label}
            </span>
          </div>
        ))}
        
        {/* Start-Slider */}
        <div 
          ref={startHandleRef}
          className="absolute top-0 w-4 h-8 bg-blue-500 dark:bg-blue-400 cursor-ew-resize rounded-md border border-blue-600 shadow-md z-10 hover:bg-blue-600 dark:hover:bg-blue-500 flex items-center justify-center"
          style={{ left: startPosition, transform: 'translateX(-50%)' }}
          onMouseDown={(e) => handleSliderMouseDown('start', e)}
          onTouchStart={(e) => handleSliderTouchStart('start', e)}
        >
          <div className="w-0.5 h-4 bg-white dark:bg-gray-200 opacity-70"></div>
        </div>
        
        {/* End-Slider */}
        <div 
          ref={endHandleRef}
          className="absolute top-0 w-4 h-8 bg-blue-500 dark:bg-blue-400 cursor-ew-resize rounded-md border border-blue-600 shadow-md z-10 hover:bg-blue-600 dark:hover:bg-blue-500 flex items-center justify-center"
          style={{ left: endPosition, transform: 'translateX(-50%)' }}
          onMouseDown={(e) => handleSliderMouseDown('end', e)}
          onTouchStart={(e) => handleSliderTouchStart('end', e)}
        >
          <div className="w-0.5 h-4 bg-white dark:bg-gray-200 opacity-70"></div>
        </div>
        
        {/* Hover-Anzeige */}
        {hoverPosition !== null && hoverDate && (
          <div 
            className="absolute top-full mt-1 -ml-16 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-md text-xs z-20"
            style={{ left: hoverPosition }}
          >
            {formatDate(hoverDate)}
          </div>
        )}
      </div>
      
      {/* Anzeige des aktuellen Bereichs */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <div>{currentRange?.startDate ? formatDate(currentRange.startDate) : ''}</div>
        <div>{currentRange?.endDate ? formatDate(currentRange.endDate) : ''}</div>
      </div>
    </div>
  );
};

export default TimelineSlider;
