import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * LazyWidget - Komponente für Lazy Loading von Dashboard-Widgets
 * Rendert ein Widget erst, wenn es im sichtbaren Bereich ist oder sich diesem nähert
 * 
 * @param {Object} props - Komponenten-Props
 * @param {React.ReactNode} props.children - Das Widget, das lazy geladen werden soll
 * @param {string} props.className - Optionale CSS-Klassen
 * @param {number} props.threshold - Schwellenwert für die Sichtbarkeit (0-1), Standard: 0.1
 * @param {number} props.rootMargin - Margin um den sichtbaren Bereich, Standard: "200px"
 * @param {string} props.placeholderHeight - Höhe des Platzhalters, Standard: "300px"
 * @param {string} props.title - Titel des Widgets für den Platzhalter
 */
const LazyWidget = ({ 
  children, 
  className = '', 
  threshold = 0.1, 
  rootMargin = '200px', 
  placeholderHeight = '300px',
  title = 'Widget wird geladen...'
}) => {
  // State für geladenes Widget
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Intersection Observer Hook mit erweiterten Optionen
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true, // Widget nur einmal laden
    // Erweiterte Optionen für bessere Erkennung in Grid-Layouts
    skip: false,
    initialInView: false
  });
  
  // Widget laden, wenn es im sichtbaren Bereich ist oder nach einer Zeitverzögerung
  useEffect(() => {
    // Sofort laden, wenn im sichtbaren Bereich
    if (inView && !isLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
    
    // Fallback: Nach 2 Sekunden auf jeden Fall laden (für Widgets, die möglicherweise nicht erkannt werden)
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        console.log(`Lazy-Loading Fallback für Widget: ${title}`);
        setIsLoaded(true);
      }
    }, 2000);
    
    return () => clearTimeout(fallbackTimer);
  }, [inView, isLoaded, title]);
  
  return (
    <div ref={ref} className={className}>
      {isLoaded ? (
        // Das eigentliche Widget rendern
        children
      ) : (
        // Platzhalter anzeigen
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse"
          style={{ minHeight: placeholderHeight }}
        >
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
            {title}
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyWidget;
