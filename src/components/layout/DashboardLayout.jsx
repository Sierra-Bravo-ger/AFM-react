import React from 'react';
import Header from './Header';

/**
 * Hauptlayout für das Dashboard
 * @param {Object} props - Komponenten-Props
 * @param {React.ReactNode} props.children - Kind-Komponenten
 */
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-200">
      <Header />
      
      {/* Dashboard-Titel */}
      <div className="container mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Schnittstellen-Überwachung</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Echtzeit-Monitoring der Dateiverarbeitung</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2 animate-pulse"></div>
              System aktiv
            </div>
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-xs font-medium whitespace-nowrap">
              Letzte Aktualisierung: {new Date().toLocaleTimeString('de-DE')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-6">
        {children}
      </div>
      
      {/* Footer mit Zusatzinformationen */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-1">AFM Dashboard</h3>
              <p className="text-sm text-gray-400">Version 3.0 - AnyFileMonitor</p>
            </div>
            <div className="flex space-x-6">
              <div>
                <h4 className="text-sm font-medium mb-1">Entwickelt mit</h4>
                <div className="flex space-x-2 text-xs text-gray-400">
                  <span className="px-2 py-1 bg-gray-700 dark:bg-gray-800 rounded">React</span>
                  <span className="px-2 py-1 bg-gray-700 dark:bg-gray-800 rounded">Tailwind CSS</span>
                  <span className="px-2 py-1 bg-gray-700 dark:bg-gray-800 rounded">Recharts</span>
                </div>
              </div>
              <div className="text-right">

                <p className="text-sm">&copy; {new Date().getFullYear()} - sierra-bravo-ger</p>
                <p className="text-xs text-gray-400">Alle Rechte vorbehalten</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
