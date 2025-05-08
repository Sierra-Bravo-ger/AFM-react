import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

// Theme Context erstellen
export const ThemeContext = createContext();

// Theme Provider Komponente
export const ThemeProvider = ({ children }) => {
  // Prüfen, ob ein gespeichertes Theme existiert oder OS-Einstellung verwenden
  const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'light'; // SSR-Fallback
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Prüfen, ob das Betriebssystem Dark Mode bevorzugt
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Theme wechseln - mit useCallback für Performance-Optimierung
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  }, []);

  // Theme-Klasse zum HTML-Element hinzufügen/entfernen - optimiert
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    // Effizientere Klassen-Manipulation: Nur die notwendigen Änderungen vornehmen
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      // Setze ein Attribut für CSS-Selektoren, die :root nicht verwenden können
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    // Optimierung: Setze eine CSS-Variable, die für Transitions verwendet werden kann
    root.style.setProperty('--theme-transition', 'all 0.2s ease');
  }, [theme]);

  // Context-Wert mit useMemo für Performance-Optimierung
  const contextValue = useMemo(() => {
    return { theme, toggleTheme };
  }, [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook für einfachen Zugriff auf den Theme-Kontext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
