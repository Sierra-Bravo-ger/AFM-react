import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Wiederverwendbare WidgetCard-Komponente für einheitliches Design aller Dashboard-Widgets
 * 
 * @param {Object} props - Komponenten-Props
 * @param {string} props.title - Titel des Widgets
 * @param {React.ReactNode} props.icon - Icon-Komponente für den Widget-Header
 * @param {React.ReactNode} props.children - Inhalt des Widgets
 * @param {boolean} props.collapsible - Ob das Widget zusammenklappbar sein soll
 * @param {boolean} props.defaultExpanded - Ob das Widget standardmäßig ausgeklappt sein soll
 * @param {string} props.className - Zusätzliche CSS-Klassen für das Widget
 * @param {Object} props.headerAction - Zusätzliche Aktion im Header (z.B. Button)
 * @param {React.ReactNode} props.headerContent - Zusätzlicher Inhalt im Header (z.B. Legende)
 */
const WidgetCard = ({ 
  title, 
  icon, 
  children, 
  collapsible = true, 
  defaultExpanded = true,
  className = '',
  headerAction,
  headerContent
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200 ${className}`}>
      {/* Header mit Titel und Toggle-Button */}
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
          {icon && <span className="mr-2 text-blue-500 dark:text-blue-400">{icon}</span>}
          {title}
        </h2>
        <div className="flex items-center space-x-2">
          {headerAction}
          {collapsible && (
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-expanded={expanded}
              aria-label={expanded ? "Zusammenklappen" : "Ausklappen"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-6 w-6 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Zusätzlicher Header-Inhalt (z.B. Legende) */}
      {headerContent && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 transition-colors duration-200">
          {headerContent}
        </div>
      )}
      
      {/* Inhalt - nur anzeigen wenn expanded true ist oder nicht collapsible */}
      <div 
        className={`
          transition-all duration-300 overflow-hidden
          ${collapsible ? (expanded ? 'max-h-[2000px]' : 'max-h-0') : ''}
        `}
      >
        {children}
      </div>
    </div>
  );
};

WidgetCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  collapsible: PropTypes.bool,
  defaultExpanded: PropTypes.bool,
  className: PropTypes.string,
  headerAction: PropTypes.node,
  headerContent: PropTypes.node
};

export default WidgetCard;
