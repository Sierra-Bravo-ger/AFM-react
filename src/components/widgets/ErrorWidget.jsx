import React, { useState, useMemo } from 'react';
import WidgetCard from '../layout/WidgetCard';

/**
 * Widget zur Anzeige von Fehlermeldungen
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.errorGroups - Gruppierte Fehlermeldungen
 * @param {boolean} props.loading - Ladezustand
 */
const ErrorWidget = ({ errorGroups, loading }) => {
  const [expandedGroup, setExpandedGroup] = useState(null);

  // Fehlertypen nach Schweregrad kategorisieren
  const errorCategories = useMemo(() => {
    if (!errorGroups) return { critical: [], warning: [], info: [] };
    
    const critical = [];
    const warning = [];
    const info = [];
    
    Object.keys(errorGroups).forEach(errorType => {
      if (errorType.includes('deadlock') || 
          errorType.includes('Timeout') || 
          errorType.includes('Zeitüberschreitung') ||
          errorType.includes('lock conflict')) {
        critical.push(errorType);
      } else if (errorType.includes('multiple') || 
                errorType.includes('Verbindung')) {
        warning.push(errorType);
      } else {
        info.push(errorType);
      }
    });
    
    return { critical, warning, info };
  }, [errorGroups]);

  // Gesamtzahl der Fehler berechnen
  const totalErrors = useMemo(() => {
    if (!errorGroups) return 0;
    return Object.values(errorGroups).reduce((sum, errors) => sum + errors.length, 0);
  }, [errorGroups]);

  // Icon für das Widget
  const errorIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  // Monitoring-Badge als Header-Action
  const monitoringBadge = (
    <div className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md text-xs font-medium flex items-center">
      <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mr-1 animate-pulse"></div>
      Monitoring
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full col-span-1 lg:col-span-2 animate-pulse transition-colors duration-200">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const errorTypes = errorGroups ? Object.keys(errorGroups) : [];
  const hasErrors = errorTypes.length > 0;

  const toggleGroup = (group) => {
    if (expandedGroup === group) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(group);
    }
  };

  // Fehlertyp-Karte mit Farbkodierung
  const ErrorTypeCard = ({ type, severity }) => {
    let bgColor, textColor, borderColor, icon;
    
    switch(severity) {
      case 'critical':
        bgColor = 'bg-red-50 dark:bg-red-900/30';
        textColor = 'text-red-700 dark:text-red-300';
        borderColor = 'border-red-200 dark:border-red-800';
        icon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
        break;
      case 'warning':
        bgColor = 'bg-amber-50 dark:bg-amber-900/30';
        textColor = 'text-amber-700 dark:text-amber-300';
        borderColor = 'border-amber-200 dark:border-amber-800';
        icon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
        break;
      default: // info
        bgColor = 'bg-blue-50 dark:bg-blue-900/30';
        textColor = 'text-blue-700 dark:text-blue-300';
        borderColor = 'border-blue-200 dark:border-blue-800';
        icon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
        );
    }
    
    return (
      <div className={`p-3 rounded-lg ${bgColor} border ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          {icon}
          <span className={`font-medium ${textColor}`}>{type}</span>
        </div>
        <span className={`text-sm px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 ${textColor}`}>
          {errorGroups[type].length}
        </span>
      </div>
    );
  };

  // Widget-Inhalt
  const errorContent = (
    <div className="p-4">
      {hasErrors && (
        <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-xs font-medium">
          {totalErrors} Fehler gesamt
        </div>
      )}
      
      {hasErrors ? (
        <>
          {/* Fehlertyp-Kategorien */}
          {(errorCategories.critical.length > 0 || 
            errorCategories.warning.length > 0 || 
            errorCategories.info.length > 0) && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-xs font-medium text-gray-600">Kritisch</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{errorCategories.critical.length}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                  <span className="text-xs font-medium text-gray-600">Warnung</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{errorCategories.warning.length}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                  <span className="text-xs font-medium text-gray-600">Info</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{errorCategories.info.length}</p>
              </div>
            </div>
          )}
          
          {/* Kritische Fehler */}
          {errorCategories.critical.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Kritische Fehler
              </h3>
              <div className="space-y-2">
                {errorCategories.critical.map(errorType => (
                  <ErrorTypeCard key={errorType} type={errorType} severity="critical" />
                ))}
              </div>
            </div>
          )}
          
          {/* Warnungen */}
          {errorCategories.warning.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Warnungen
              </h3>
              <div className="space-y-2">
                {errorCategories.warning.map(errorType => (
                  <ErrorTypeCard key={errorType} type={errorType} severity="warning" />
                ))}
              </div>
            </div>
          )}
          
          {/* Informationen */}
          {errorCategories.info.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                Informationen
              </h3>
              <div className="space-y-2">
                {errorCategories.info.map(errorType => (
                  <ErrorTypeCard key={errorType} type={errorType} severity="info" />
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-5">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
              <span>Fehlerdetails</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{errorTypes.length} Fehlertypen</span>
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {errorTypes.map((errorType) => {
                const errors = errorGroups[errorType];
                const count = errors.length;
                const isExpanded = expandedGroup === errorType;
                
                // Bestimme die Farbe basierend auf dem Fehlertyp
                let bgColor, borderColor, dotColor, hoverColor;
                
                if (errorCategories.critical.includes(errorType)) {
                  bgColor = isExpanded ? 'bg-red-50 dark:bg-red-900/30' : 'bg-white dark:bg-gray-800';
                  borderColor = 'border-red-200 dark:border-red-800';
                  dotColor = 'bg-red-500 dark:bg-red-400';
                  hoverColor = 'hover:bg-red-50 dark:hover:bg-red-900/20';
                } else if (errorCategories.warning.includes(errorType)) {
                  bgColor = isExpanded ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-white dark:bg-gray-800';
                  borderColor = 'border-amber-200 dark:border-amber-800';
                  dotColor = 'bg-amber-500 dark:bg-amber-400';
                  hoverColor = 'hover:bg-amber-50 dark:hover:bg-amber-900/20';
                } else {
                  bgColor = isExpanded ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800';
                  borderColor = 'border-blue-200 dark:border-blue-800';
                  dotColor = 'bg-blue-500 dark:bg-blue-400';
                  hoverColor = 'hover:bg-blue-50 dark:hover:bg-blue-900/20';
                }
                
                return (
                  <div key={errorType} className={`border rounded-lg overflow-hidden shadow-sm ${borderColor}`}>
                    <div 
                      className={`flex justify-between items-center p-3 cursor-pointer ${bgColor} ${!isExpanded && hoverColor}`}
                      onClick={() => toggleGroup(errorType)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                        <span className="font-medium">{errorType}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm bg-white px-2 py-0.5 rounded-full border shadow-sm">
                          {count}
                        </span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-3 border-t bg-white">
                        <div className="max-h-48 overflow-y-auto">
                          <table className="min-w-full text-sm border-separate border-spacing-y-1">
                            <thead>
                              <tr>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Zeitpunkt</th>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Datei</th>
                              </tr>
                            </thead>
                            <tbody>
                              {errors.slice(0, 5).map((error, index) => (
                                <tr key={index} className="bg-gray-50 hover:bg-gray-100">
                                  <td className="px-2 py-1.5 rounded-l-md">{error.Zeitpunkt}</td>
                                  <td className="px-2 py-1.5 font-mono text-xs rounded-r-md">{error.ErrorDatei}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {errors.length > 5 && (
                            <div className="text-xs text-gray-500 text-center mt-2 py-1 bg-gray-50 rounded">
                              + {errors.length - 5} weitere Einträge
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-green-100 rounded-full p-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium text-center">Keine Fehlermeldungen vorhanden</p>
          <p className="text-gray-500 text-sm text-center mt-1">Alle Systeme arbeiten normal</p>
        </div>
      )}
    </div>
  );
  
  return (
    <WidgetCard
      title="Fehler-Übersicht"
      icon={errorIcon}
      headerAction={monitoringBadge}
      collapsible={true}
      defaultExpanded={true}
      className="h-full col-span-1 lg:col-span-2"
    >
      {errorContent}
    </WidgetCard>
  );
};

export default ErrorWidget;
