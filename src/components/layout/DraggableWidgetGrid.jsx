import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DraggableWidgetGrid.css'; // Importieren der eigenen CSS-Datei für verbesserte Resize-Handles

// WidthProvider fügt automatisch die Breite hinzu
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * DraggableWidgetGrid - Anpassbares Grid-Layout für Widgets mit Drag & Drop
 * 
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.children - Die Widget-Komponenten als Kinder
 * @param {Array} props.layouts - Vorgegebene Layouts für verschiedene Bildschirmgrößen
 * @param {Function} props.onLayoutChange - Callback für Änderungen am Layout
 * @param {boolean} props.isDraggable - Ob Widgets verschoben werden können
 * @param {boolean} props.isResizable - Ob Widgets in der Größe verändert werden können
 */
const DraggableWidgetGrid = ({ 
  children, 
  layouts: propLayouts,
  onLayoutChange,
  isDraggable = true,
  isResizable = true
}) => {
  // State für eingeklappte Widgets
  const [collapsedWidgets, setCollapsedWidgets] = useState({});
  // Standardlayout, falls keines übergeben wurde
  const defaultLayouts = {
    lg: [
      { i: '.$system-health', x: 9, y: 0, w: 3, h: 20 },
      { i: '.$status', x: 6, y: 0, w: 3, h: 22 },
      { i: '.$throughput', x: 2, y: 0, w: 4, h: 15 },
      { i: '.$error-time', x: 0, y: 132, w: 6, h: 14 },
      { i: '.$error-heatmap', x: 0, y: 22, w: 12, h: 13 },
      { i: '.$file-count', x: 0, y: 146, w: 6, h: 7 },
      { i: '.$pattern-match', x: 0, y: 72, w: 12, h: 22 },
      { i: '.$error-stacked-line', x: 0, y: 35, w: 12, h: 18 },
      { i: '.$error-stacked-bar', x: 0, y: 53, w: 12, h: 19 },
      { i: '.$error-groups', x: 0, y: 94, w: 12, h: 38 },
      { i: '.$error-treemap', x: 0, y: 0, w: 2, h: 18 },
      { i: '.$error-rate', x: 6, y: 145, w: 6, h: 16 },
      { i: '.$throughput-line', x: 6, y: 132, w: 6, h: 13 }
    ],
    md: [
      { i: '.$system-health', x: 0, y: 0, w: 2, h: 20 },
      { i: '.$status', x: 0, y: 20, w: 2, h: 22 },
      { i: '.$throughput', x: 0, y: 42, w: 2, h: 15 },
      { i: '.$error-time', x: 0, y: 57, w: 2, h: 14 },
      { i: '.$error-heatmap', x: 0, y: 71, w: 2, h: 13 },
      { i: '.$file-count', x: 0, y: 84, w: 2, h: 7 },
      { i: '.$pattern-match', x: 0, y: 91, w: 2, h: 22 },
      { i: '.$error-stacked-line', x: 0, y: 113, w: 2, h: 18 },
      { i: '.$error-stacked-bar', x: 0, y: 131, w: 2, h: 19 },
      { i: '.$error-groups', x: 0, y: 150, w: 2, h: 38 },
      { i: '.$error-treemap', x: 0, y: 188, w: 2, h: 18 },
      { i: '.$error-rate', x: 0, y: 206, w: 2, h: 16 },
      { i: '.$throughput-line', x: 0, y: 222, w: 2, h: 13 }
    ],
    sm: [
      { i: '.$system-health', x: 0, y: 0, w: 1, h: 20 },
      { i: '.$status', x: 0, y: 20, w: 1, h: 22 },
      { i: '.$throughput', x: 0, y: 42, w: 1, h: 15 },
      { i: '.$error-time', x: 0, y: 57, w: 1, h: 14 },
      { i: '.$error-heatmap', x: 0, y: 71, w: 1, h: 13 },
      { i: '.$file-count', x: 0, y: 84, w: 1, h: 7 },
      { i: '.$pattern-match', x: 0, y: 91, w: 1, h: 22 },
      { i: '.$error-stacked-line', x: 0, y: 113, w: 1, h: 18 },
      { i: '.$error-stacked-bar', x: 0, y: 131, w: 1, h: 19 },
      { i: '.$error-groups', x: 0, y: 150, w: 1, h: 38 },
      { i: '.$error-treemap', x: 0, y: 188, w: 1, h: 18 },
      { i: '.$error-rate', x: 0, y: 206, w: 1, h: 16 },
      { i: '.$throughput-line', x: 0, y: 222, w: 1, h: 13 }
    ],
    xs: [
      { i: '.$system-health', x: 0, y: 0, w: 1, h: 20 },
      { i: '.$status', x: 0, y: 20, w: 1, h: 22 },
      { i: '.$throughput', x: 0, y: 42, w: 1, h: 15 },
      { i: '.$error-time', x: 0, y: 57, w: 1, h: 14 },
      { i: '.$error-heatmap', x: 0, y: 71, w: 1, h: 13 },
      { i: '.$file-count', x: 0, y: 84, w: 1, h: 7 },
      { i: '.$pattern-match', x: 0, y: 91, w: 1, h: 22 },
      { i: '.$error-stacked-line', x: 0, y: 113, w: 1, h: 18 },
      { i: '.$error-stacked-bar', x: 0, y: 131, w: 1, h: 19 },
      { i: '.$error-groups', x: 0, y: 150, w: 1, h: 38 },
      { i: '.$error-treemap', x: 0, y: 188, w: 1, h: 18 },
      { i: '.$error-rate', x: 0, y: 206, w: 1, h: 16 },
      { i: '.$throughput-line', x: 0, y: 222, w: 1, h: 13 }
    ]
  };

  // Funktion zum Laden des gespeicherten Layouts
  const loadSavedLayouts = () => {
    try {
      const savedLayouts = localStorage.getItem('dashboardLayouts');
      if (savedLayouts) {
        const parsed = JSON.parse(savedLayouts);
        console.log('Geladenes Layout:', parsed);
        
        // Einfache Prüfung, ob das Layout gültig ist
        if (parsed && parsed.lg && Array.isArray(parsed.lg)) {
          return parsed;
        }
        console.warn('Ungültiges Layout-Format im LocalStorage, verwende Standard-Layout');
      }
      return defaultLayouts;
    } catch (error) {
      console.error('Fehler beim Laden des Layouts:', error);
      return defaultLayouts;
    }
  };

  // State für Layouts
  const [layouts, setLayouts] = useState(() => {
    // Verzögertes Laden, um sicherzustellen, dass localStorage verfügbar ist
    return loadSavedLayouts();
  });

  // Funktion zum Speichern des Layouts
  const handleLayoutChange = (currentLayout, allLayouts) => {
    // Immer das aktuelle Layout speichern
    setLayouts(allLayouts);
    
    try {
      localStorage.setItem('dashboardLayouts', JSON.stringify(allLayouts));
      console.log('Layout gespeichert:', allLayouts);
    } catch (error) {
      console.error('Fehler beim Speichern des Layouts:', error);
    }
    
    // Callback aufrufen, falls vorhanden
    if (onLayoutChange) {
      onLayoutChange(currentLayout, allLayouts);
    }
  };

  // Konfiguration für das Grid
  const gridConfig = {
    className: "layout",
    layouts: layouts,
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
    cols: { lg: 12, md: 2, sm: 1, xs: 1 },
    rowHeight: 15,
    containerPadding: [15, 15],
    margin: [15, 15],
    onLayoutChange: handleLayoutChange,
    isDraggable: isDraggable,
    isResizable: isResizable,
    useCSSTransforms: true,
    compactType: 'vertical',
    preventCollision: false,
    // Wichtig: Automatisches Verteilen auf Spalten aktivieren
    verticalCompact: true,
    // Automatisches Füllen von Lücken
    compactType: 'vertical',
    // Spezifisches Element für Drag-Handle, damit Buttons klickbar bleiben
    draggableHandle: ".drag-handle"
  };

  // State für Feedback-Nachricht
  const [resetFeedback, setResetFeedback] = useState(false);

  // Callback-Funktion für Widget-Collapse-Events - wird jetzt direkt vom WidgetCard-Button aufgerufen
  const handleWidgetCollapse = useCallback((widgetId, isCollapsed) => {
    console.log(`Widget ${widgetId} ist jetzt ${isCollapsed ? 'eingeklappt' : 'ausgeklappt'}`);
    
    // Aktuellen Zustand setzen
    setCollapsedWidgets(prev => {
      const newState = {
        ...prev,
        [widgetId]: isCollapsed
      };
      return newState;
    });
    
    // Aktuelles Layout sofort anpassen
    const updatedLayouts = {};
    
    // Für jeden Breakpoint das Layout anpassen
    Object.keys(layouts).forEach(breakpoint => {
      if (!layouts[breakpoint] || !Array.isArray(layouts[breakpoint])) return;
      
      // Layout für diesen Breakpoint kopieren
      updatedLayouts[breakpoint] = layouts[breakpoint].map(item => {
        // Widget-ID ohne Präfix extrahieren
        const itemWidgetId = item.i.startsWith('.$') ? item.i.substring(2) : item.i;
        
        // Nur das betroffene Widget anpassen
        if (itemWidgetId === widgetId) {
          if (isCollapsed) {
            // Höhe auf genau 2 Einheiten (2 Zeilen) setzen
            return { ...item, h: 2 };
          } else {
            // Originalhöhe aus dem Standardlayout wiederherstellen
            const defaultItem = defaultLayouts[breakpoint]?.find(d => d.i === item.i);
            if (defaultItem) {
              return { ...item, h: defaultItem.h };
            }
          }
        }
        return item;
      });
    });
    
    // Layout aktualisieren
    setLayouts(updatedLayouts);
    
    // Im LocalStorage speichern
    try {
      localStorage.setItem('dashboardLayouts', JSON.stringify(updatedLayouts));
    } catch (error) {
      console.error('Fehler beim Speichern des angepassten Layouts:', error);
    }
  }, [layouts, defaultLayouts]);
  
  // Globaler Event-Listener für Collapse-Events von WidgetCard-Komponenten
  useEffect(() => {
    // Event-Handler für Collapse-Events
    const handleCollapseEvent = (event) => {
      if (event.detail && event.detail.widgetId && typeof event.detail.isCollapsed === 'boolean') {
        handleWidgetCollapse(event.detail.widgetId, event.detail.isCollapsed);
      }
    };
    
    // Event-Listener registrieren
    window.addEventListener('widget-collapse', handleCollapseEvent);
    
    // Event-Listener entfernen beim Cleanup
    return () => {
      window.removeEventListener('widget-collapse', handleCollapseEvent);
    };
  }, [handleWidgetCollapse]);

  // Funktion zum Zurücksetzen des Layouts
  const resetLayout = () => {
    // Layouts zurücksetzen
    setLayouts(defaultLayouts);
    // Explizit das defaultLayouts im LocalStorage speichern
    localStorage.setItem('dashboardLayouts', JSON.stringify(defaultLayouts));
    console.log('Layout zurückgesetzt auf:', defaultLayouts);
    
    // Feedback anzeigen statt Seite neu zu laden
    setResetFeedback(true);
    // Feedback nach 2 Sekunden ausblenden
    setTimeout(() => setResetFeedback(false), 2000);
  };

  // Hinweistext für Drag & Drop und Reset-Button
  const dragHint = (
    <div className="flex items-center space-x-2 mb-2 pointer-events-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
      <span className="text-blue-800 dark:text-blue-200">Widgets können per Drag & Drop verschoben werden</span>
    </div>
  );

  // Debug-Ausgabe des aktuellen Layouts
  useEffect(() => {
    console.log('Aktuelles Layout:', layouts);
  }, [layouts]);

  // Debug-Ausgabe der collapsedWidgets
  useEffect(() => {
    if (Object.keys(collapsedWidgets).length > 0) {
      console.log('Aktueller Collapse-Status:', collapsedWidgets);
    }
  }, [collapsedWidgets]);

  // Funktion zum vollständigen Löschen des LocalStorage
  const clearAllStorage = () => {
    localStorage.clear();
    // Layouts zurücksetzen
    setLayouts(defaultLayouts);
    // Feedback anzeigen statt Seite neu zu laden
    setResetFeedback(true);
    // Feedback nach 2 Sekunden ausblenden
    setTimeout(() => setResetFeedback(false), 2000);
  };

  return (
    <div className="relative">
      {resetFeedback && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg transition-all duration-300 ease-in-out">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 dark:text-green-200">Layout erfolgreich zurückgesetzt!</span>
          </div>
        </div>
      )}
      <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <p className="text-sm text-blue-800 dark:text-blue-200 mr-2">Grid-Konfiguration: {gridConfig.cols.lg} Spalten, {gridConfig.rowHeight}px Zeilenhöhe</p>
            {isDraggable && (
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span className="text-blue-800 dark:text-blue-200 text-sm">Widgets können per Drag & Drop verschoben werden</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={resetLayout}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs transition-colors"
            >
              Layout zurücksetzen
            </button>
            <button 
              onClick={clearAllStorage}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs transition-colors"
            >
              Alles zurücksetzen
            </button>
          </div>
        </div>
      </div>
      <ResponsiveGridLayout 
        {...gridConfig}
        onLayoutChange={(currentLayout, allLayouts) => handleLayoutChange(currentLayout, allLayouts)}
      >
        {React.Children.map(children, (child, index) => {
          // Prüfen, ob das Kind ein gültiges React-Element ist
          if (!React.isValidElement(child)) return null;
          
          // Eindeutige ID für jedes Widget
          const widgetId = child.key || `widget-${index}`;
          // ID ohne Präfix für die Kollaps-Funktion
          const cleanWidgetId = widgetId.startsWith('.$') ? widgetId.substring(2) : widgetId;
          
          // Titel des Widgets extrahieren
          const widgetTitle = child.props.title || `Widget ${index + 1}`;
          
          // Prüfen, ob das Widget eingeklappt ist
          const isCollapsed = collapsedWidgets[cleanWidgetId] || false;
          
          // Wir verwenden die originalen Widgets, aber mit einem speziellen Drag-Handle
          return (
            <div 
              key={widgetId} 
              className="widget-container" 
              data-widget-id={cleanWidgetId}
              data-widget-index={index}
              title={`Widget: ${cleanWidgetId}`}
            >
              {/* Drag-Handle als separates Element - nur links im Header-Bereich */}
              <div className="drag-handle absolute top-0 left-0 w-3/4 h-10 z-10 cursor-move opacity-0 hover:opacity-30 bg-blue-200 dark:bg-blue-800 transition-opacity duration-200"></div>
              
              {/* Das eigentliche Widget mit angepasster Höhe basierend auf dem Collapse-Status */}
              <div 
                className="widget-wrapper transition-all duration-300 ease-in-out overflow-hidden"
                style={{ height: isCollapsed ? '40px' : '100%' }}
              >
                {/* Debug-Information für leere Widgets */}
                {!child && (
                  <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
                    Widget {cleanWidgetId} konnte nicht geladen werden.
                  </div>
                )}
                {child}
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DraggableWidgetGrid;
