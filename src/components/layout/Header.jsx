import React from 'react';
import ThemeToggle from './ThemeToggle';

/**
 * Header-Komponente für das AFM-Dashboard
 */
const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-gray-900 dark:to-black text-white shadow-lg transition-colors duration-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg shadow-md">
            <img src="/AFM3.svg" alt="AFM Logo" className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-baseline">
              <h1 className="text-2xl font-bold tracking-tight">AFM</h1>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-blue-600 rounded-full">v3.0</span>
            </div>
            <p className="text-sm text-blue-200">AnyFileMonitor Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Info</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Einstellungen</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Letztes Update:</p>
              <p className="text-xs text-gray-300" id="lastUpdate">
                {new Date().toLocaleString('de-DE')}
              </p>
            </div>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex flex-col items-center shadow-md"
              onClick={() => window.location.reload()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Aktualisieren</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
