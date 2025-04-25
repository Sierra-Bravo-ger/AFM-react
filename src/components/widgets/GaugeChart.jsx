import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

/**
 * GaugeChart-Komponente zur Visualisierung eines Scores zwischen 0 und 100
 * @param {number} value - Der anzuzeigende Wert (0-100)
 * @param {string} size - Größe des Charts ('sm', 'md', 'lg')
 * @param {boolean} showValue - Ob der Wert im Chart angezeigt werden soll
 * @returns {JSX.Element} GaugeChart-Komponente
 */
const GaugeChart = ({ value, size = 'md', showValue = true, showValueInside = false }) => {
  // Sicherstellen, dass der Wert zwischen 0 und 100 liegt
  const safeValue = Math.max(0, Math.min(100, value));
  
  // Berechnung der Farbe basierend auf dem Wert
  const getColor = (val) => {
    if (val >= 75) return '#10B981'; // Grün für hohe Werte
    if (val >= 50) return '#34D399'; // Hellgrün für mittlere Werte
    if (val >= 25) return '#FBBF24'; // Gelb für niedrige Werte
    return '#EF4444'; // Rot für sehr niedrige Werte
  };
  
  // Berechnung der Hintergrundfarbe basierend auf dem Wert und dem Farbschema
  const getBackgroundColor = (val) => {
    if (val >= 75) return '#ECFDF5'; // Hellgrüner Hintergrund für hohe Werte
    if (val >= 50) return '#D1FAE5'; // Sehr heller grüner Hintergrund für mittlere Werte
    if (val >= 25) return '#FEF3C7'; // Heller gelber Hintergrund für niedrige Werte
    return '#FEE2E2'; // Heller roter Hintergrund für sehr niedrige Werte
  };
  
  // Berechnung der Farbe für den dunklen Modus
  const getDarkModeColor = (val) => {
    if (val >= 75) return '#065F46'; // Dunkelgrün für hohe Werte
    if (val >= 50) return '#047857'; // Mittleres Grün für mittlere Werte
    if (val >= 25) return '#B45309'; // Dunkelgelb für niedrige Werte
    return '#B91C1C'; // Dunkelrot für sehr niedrige Werte
  };

  // Berechnung der Größe basierend auf dem size-Parameter
  const getSize = () => {
    switch (size) {
      case 'sm': return 100;
      case 'lg': return 180;
      default: return 140; // md ist default
    };
  };
  
  // Berechnung der Höhe des Charts
  const getHeight = (width) => {
    // Höhe etwas größer als die Hälfte der Breite, damit der Halbkreis vollständig sichtbar ist
    return Math.floor(width * 0.75);
  };
  
  // Berechnung der Radien für den Pie-Chart
  const getRadii = (size) => {
    // Kleinere Radien verwenden, damit der Chart nicht abgeschnitten wird
    const outerRadius = size * 0.45;
    const innerRadius = outerRadius * 0.8;
    return { innerRadius, outerRadius };
  };
  
  // Daten für das Gauge-Chart
  const data = [
    { name: 'Score', value: safeValue },
    { name: 'Empty', value: 100 - safeValue }
  ];
  
  // Farben für die Segmente
  const COLORS = [getColor(safeValue), 'rgba(229, 231, 235, 0.3)'];
  
  // Größe des Charts
  const chartSize = getSize();
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        style={{ 
          width: chartSize, 
          height: getHeight(chartSize), 
          position: 'relative'
        }}
        className="rounded-t-full overflow-hidden"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={getRadii(chartSize).innerRadius}
              outerRadius={getRadii(chartSize).outerRadius}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={index === 0 ? getDarkModeColor(safeValue) : 'none'}
                  strokeWidth={1}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {showValue && showValueInside && (
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '0',
              left: '50%', 
              transform: 'translateX(-50%)',
              color: getColor(safeValue),
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              paddingBottom: '2px'
            }}
            className={`font-bold ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'} dark:text-white`}
          >
            {Math.round(safeValue)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default GaugeChart;
