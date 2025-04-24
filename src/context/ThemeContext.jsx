import React, { createContext, useState, useEffect, useContext } from 'react';

// Theme Context erstellen
export const ThemeContext = createContext();

// Theme Provider Komponente
export const ThemeProvider = ({ children }) => {
  // Prüfen, ob ein gespeichertes Theme existiert oder OS-Einstellung verwenden
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Prüfen, ob das Betriebssystem Dark Mode bevorzugt
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Theme wechseln
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Theme-Klasse zum HTML-Element hinzufügen/entfernen
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
