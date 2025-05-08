import React, { useState, useMemo, useCallback, memo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import WidgetCard from '../layout/WidgetCard';
import { normalizeErrorType, getErrorTypeColor, extractErrorType, ERROR_TYPE_COLORS } from '../../utils/ErrorTypeUtils';

/**
 * Widget zur Anzeige von Fehlertypen als Treemap
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.patternData - Die Muster-Daten aus der CSV
 * @param {boolean} props.loading - Ladezustand
 */
const ErrorTreemapWidget = memo(({ patternData, loading }) => {
  // Alle useState-Hooks müssen vor allen anderen Hooks aufgerufen werden
  const [selectedPattern, setSelectedPattern] = useState(null);
  
  // Handler für die Auswahl eines Musters - memoiziert für bessere Performance
  const handlePatternSelect = useCallback((pattern) => {
    setSelectedPattern(pattern === selectedPattern ? null : pattern);
  }, [selectedPattern]);

  // Daten für die Treemap vorbereiten
  const chartData = useMemo(() => {
    if (!patternData || patternData.length === 0) {
      return [];
    }

    // Gruppiere Fehlertypen und zähle die Häufigkeit
    const patternCounts = {};
    patternData.forEach(pattern => {
      const normalizedType = normalizeErrorType(pattern.Muster || 'Unbekannt');
      if (!patternCounts[normalizedType]) {
        patternCounts[normalizedType] = 0;
      }
      patternCounts[normalizedType] += 1;
    });

    // Konvertiere in Array und sortiere nach Häufigkeit
    const sortedPatterns = Object.entries(patternCounts)
      .map(([type, count]) => ({
        name: type,
        size: count,
        color: getErrorTypeColor(type, 'hex'),
        value: count // Für Tooltip
      }))
      .sort((a, b) => b.size - a.size);

    // Struktur für Treemap erstellen
    return {
      name: 'Fehlertypen',
      children: sortedPatterns
    };
  }, [patternData]);

  // Tooltip-Anpassung - memoiziert für bessere Performance
  const CustomTooltip = useMemo(() => {
    return ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
            <p className="font-medium">{data.name}</p>
            <p className="text-gray-700 dark:text-gray-300">
              Anzahl: <span className="font-medium">{data.value}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Anteil: <span className="font-medium">{Math.round((data.value / patternData.length) * 100)}%</span>
            </p>
          </div>
        );
      }
      return null;
    };
  }, [patternData.length]);

  // Custom Rendering für die Treemap-Zellen - memoiziert für bessere Performance
  const CustomizedContent = useMemo(() => {
    return (props) => {
      const { x, y, width, height, name, value, color } = props;
      
      // Nur Text anzeigen, wenn genug Platz vorhanden ist
      const showText = width > 30 && height > 30;
      
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: color,
              stroke: '#fff',
              strokeWidth: 2,
              strokeOpacity: 0.7,
            }}
          />
          {showText && (
            <>
              <text
                x={x + width / 2}
                y={y + height / 2 - 8}
                textAnchor="middle"
                fill="#fff"
                fontSize={12}
                fontWeight="bold"
                className="select-none pointer-events-none"
              >
                {name}
              </text>
              <text
                x={x + width / 2}
                y={y + height / 2 + 8}
                textAnchor="middle"
                fill="#fff"
                fontSize={12}
                className="select-none pointer-events-none"
              >
                {value}
              </text>
            </>
          )}
        </g>
      );
    };
  }, []);

  // Icon für das Widget - memoiziert für bessere Performance
  const chartIcon = useMemo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ), []);

  // Lade-Skeleton als memoizierte Komponente für bessere Performance
  const LoadingSkeleton = useMemo(() => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse transition-colors duration-200">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded"></div>
    </div>
  ), []);
  
  // Keine Daten Ansicht - memoiziert für bessere Performance
  const NoDataView = useMemo(() => (
    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
      Keine Daten verfügbar
    </div>
  ), []);
  
  // Wir müssen alle Hooks immer in der gleichen Reihenfolge aufrufen,
  // daher dürfen wir keine frühen Returns verwenden, bevor alle Hooks aufgerufen wurden

  // Chart-Inhalt - memoiziert für bessere Performance
  const chartContent = useMemo(() => {
    if (!chartData.children || chartData.children.length === 0) {
      return NoDataView;
    }
    
    return (
      <div className="p-4 bg-white dark:bg-gray-800">
        <div style={{ height: '400px' }} className="w-full bg-white dark:bg-gray-800">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={chartData.children}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }, [chartData.children, CustomizedContent, CustomTooltip, NoDataView]);
  
  // Jetzt können wir bedingte Rückgaben machen, nachdem alle Hooks aufgerufen wurden
  if (loading) {
    return (
      <WidgetCard
        title="Fehlertypen-Treemap"
        icon={chartIcon}
        collapsible={true}
        defaultExpanded={true}
      >
        {LoadingSkeleton}
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Fehlertypen-Treemap"
      icon={chartIcon}
      collapsible={true}
      defaultExpanded={true}
    >
      {chartContent}
    </WidgetCard>
  );
});

export default ErrorTreemapWidget;
