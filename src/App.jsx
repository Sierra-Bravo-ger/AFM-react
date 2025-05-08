import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import FilterBar from './components/layout/FilterBar';
import FloatingTimelinePanel from './components/layout/FloatingTimelinePanel';
import LazyWidget from './components/layout/LazyWidget';
import DraggableWidgetGrid from './components/layout/DraggableWidgetGrid';
import StatusWidget from './components/widgets/StatusWidget';
import ErrorWidget from './components/widgets/ErrorWidget';
import FileCountWidget from './components/widgets/FileCountWidget';
import PatternMatchWidget from './components/widgets/PatternMatchWidget';
import ErrorStackedLineWidget from './components/widgets/ErrorStackedLineWidget';
import ErrorStackedBarWidget from './components/widgets/ErrorStackedBarWidget';

// Neue Widgets importieren
import SystemHealthWidget from './components/widgets/SystemHealthWidget';
import ThroughputWidget from './components/widgets/ThroughputWidget';
import ErrorTimeAnalysisWidget from './components/widgets/ErrorTimeAnalysisWidget';
import ErrorHeatmapWidget from './components/widgets/ErrorHeatmapWidget';
import ErrorRateLineWidget from './components/widgets/ErrorRateLineWidget';
import ThroughputLineWidget from './components/widgets/ThroughputLineWidget';
import ErrorTreemapWidget from './components/widgets/ErrorTreemapWidget';

import { loadCSVData } from './utils/DataLoader';
import { 
  calculateStatusStatistics, 
  groupErrorsByType, 
  countFilesByTimestamp, 
  analyzePatternMatches 
} from './utils/DataProcessor.jsx';

// Erweiterte Metriken importieren
import {
  calculateSystemHealth,
  calculateErrorRate,
  calculateThroughput,
  calculateErrorTrend,
  analyzeErrorsByHour,
  analyzeErrorsByDay,
  createErrorHeatmap
} from './utils/AdvancedMetrics';

import './App.css';

function App() {
  // State für die geladenen Daten
  const [statusData, setStatusData] = useState([]);
  const [errorData, setErrorData] = useState([]);
  const [inputData, setInputData] = useState([]);
  const [patternData, setPatternData] = useState([]);
  
  // State für gefilterte Daten
  const [filteredStatusData, setFilteredStatusData] = useState([]);
  const [filteredErrorData, setFilteredErrorData] = useState([]);
  const [filteredInputData, setFilteredInputData] = useState([]);
  const [filteredPatternData, setFilteredPatternData] = useState([]);
  
  // State für verarbeitete Daten
  const [statusStats, setStatusStats] = useState({});
  const [errorGroups, setErrorGroups] = useState([]);
  const [fileCountData, setFileCountData] = useState([]);
  const [patternAnalysis, setPatternAnalysis] = useState(null);
  
  // State für erweiterte Metriken
  const [systemHealth, setSystemHealth] = useState(null);
  const [throughput, setThroughput] = useState(null);
  const [errorsByHour, setErrorsByHour] = useState(null);
  const [errorsByDay, setErrorsByDay] = useState(null);
  const [errorHeatmap, setErrorHeatmap] = useState(null);
  
  // State für den ausgewählten Fehlertyp in der Heatmap
  const [selectedErrorType, setSelectedErrorType] = useState(null);
  
  // Zeitraum-Filter
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  // Min/Max Datum für den Filter
  const [minMaxDates, setMinMaxDates] = useState({
    minDate: null,
    maxDate: null
  });
  
  // Ladezustand
  const [loading, setLoading] = useState(true);
  
  // Funktion zum Filtern der Daten nach Zeitraum
  const filterDataByDateRange = useCallback((data, startDate, endDate) => {
    if (!startDate || !endDate || !data || data.length === 0) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.Zeitpunkt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, []);
  
  // Funktion zum Ermitteln des Min/Max-Datums aus allen Datensätzen
  const determineMinMaxDates = useCallback((statusData, errorData, inputData, patternData) => {
    const allDates = [
      ...statusData.map(item => new Date(item.Zeitpunkt)),
      ...errorData.map(item => new Date(item.Zeitpunkt)),
      ...inputData.map(item => new Date(item.Zeitpunkt)),
      ...patternData.map(item => new Date(item.Zeitpunkt))
    ].filter(date => !isNaN(date.getTime()));
    
    if (allDates.length === 0) return { minDate: null, maxDate: null };
    
    return {
      minDate: new Date(Math.min(...allDates)),
      maxDate: new Date(Math.max(...allDates))
    };
  }, []);
  
  // Handler für Änderungen am Zeitraum-Filter
  const handleFilterChange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
  }, []);
  
  // Referenz, um zu verfolgen, ob die Daten bereits initial geladen wurden
  const initialLoadRef = useRef(false);
  
  // Daten laden - ohne Abhängigkeit von dateRange, um Endlosschleifen zu vermeiden
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      
      try {
        // CSV-Dateien laden
        const statusResult = await loadCSVData('./AFMlog/AFM_status_log.csv');
        const errorResult = await loadCSVData('./AFMlog/AFM_error_log.csv');
        const inputResult = await loadCSVData('./AFMlog/AFM_input_details.csv');
        const patternResult = await loadCSVData('./AFMlog/AFM_pattern_matches.csv');
        
        // Daten setzen
        setStatusData(statusResult);
        setErrorData(errorResult);
        setInputData(inputResult);
        setPatternData(patternResult);
        
        // Min/Max-Datum ermitteln
        const { minDate, maxDate } = determineMinMaxDates(
          statusResult, 
          errorResult, 
          inputResult, 
          patternResult
        );
        setMinMaxDates({ minDate, maxDate });
        
        // Standard-Zeitraum nur beim ersten Laden setzen
        if (!initialLoadRef.current && maxDate) {
          initialLoadRef.current = true;
          const endDate = maxDate;
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 1);
          
          // Nur setzen, wenn noch nicht gesetzt
          if (!dateRange.startDate || !dateRange.endDate) {
            setDateRange({ startDate, endDate });
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
    
    // Automatisches Neuladen alle 5 Minuten
    const intervalId = setInterval(() => {
      loadAllData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [determineMinMaxDates]); // Entferne dateRange aus den Abhängigkeiten
  
  // Daten filtern, wenn sich der Zeitraum ändert
  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    
    const filteredStatus = filterDataByDateRange(statusData, dateRange.startDate, dateRange.endDate);
    const filteredError = filterDataByDateRange(errorData, dateRange.startDate, dateRange.endDate);
    const filteredInput = filterDataByDateRange(inputData, dateRange.startDate, dateRange.endDate);
    const filteredPattern = filterDataByDateRange(patternData, dateRange.startDate, dateRange.endDate);
    
    setFilteredStatusData(filteredStatus);
    setFilteredErrorData(filteredError);
    setFilteredInputData(filteredInput);
    setFilteredPatternData(filteredPattern);
    
    // Verarbeitete Daten aktualisieren
    const newStatusStats = calculateStatusStatistics(filteredStatus);
    setStatusStats(newStatusStats);
    setErrorGroups(groupErrorsByType(filteredError));
    setFileCountData(countFilesByTimestamp(filteredInput));
    setPatternAnalysis(analyzePatternMatches(filteredPattern));
    
    // Erweiterte Metriken berechnen
    const newSystemHealth = calculateSystemHealth(newStatusStats, filteredError, filteredInput, patternAnalysis);
    const newThroughput = calculateThroughput(newStatusStats, filteredInput);
    const newErrorsByHour = analyzeErrorsByHour(filteredError);
    const newErrorsByDay = analyzeErrorsByDay(filteredError);
    const newErrorHeatmap = createErrorHeatmap(filteredError, selectedErrorType);
    
    // Erweiterte Metriken aktualisieren
    setSystemHealth(newSystemHealth);
    setThroughput(newThroughput);
    setErrorsByHour(newErrorsByHour);
    setErrorsByDay(newErrorsByDay);
    setErrorHeatmap(newErrorHeatmap);
  }, [dateRange, statusData, errorData, inputData, patternData, filterDataByDateRange, selectedErrorType]);
  
  // Handler für Änderungen am Fehlertyp-Filter
  const handleErrorTypeChange = useCallback((errorType) => {
    setSelectedErrorType(errorType);
  }, []);
  
  // Handler für Layout-Änderungen
  const handleLayoutChange = (currentLayout, allLayouts) => {
    console.log('Layout geändert:', allLayouts);
  };
  
  return (
    <DashboardLayout>
      {/* Schwebendes Zeitraum-Filter-Panel */}
      <FloatingTimelinePanel 
        dateRange={dateRange}
        onDateRangeChange={handleFilterChange}
        minDate={minMaxDates.minDate}
        maxDate={minMaxDates.maxDate}
      />
      
      {/* Zeitraum-Filter - als Überschrift/Info */}
      <div className="col-span-full mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Dashboard-Übersicht</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Zeitraum: {dateRange.startDate ? dateRange.startDate.toLocaleDateString() : 'Alle'} bis {dateRange.endDate ? dateRange.endDate.toLocaleDateString() : 'Alle'}
          </p>
        </div>
      </div>
      
      {/* Anpassbares Widget-Grid mit Drag & Drop */}
      <DraggableWidgetGrid onLayoutChange={handleLayoutChange}>
        {/* System-Gesundheit-Widget */}
        <LazyWidget key="system-health" title="System-Gesundheit" placeholderHeight="250px">
          <SystemHealthWidget systemHealth={systemHealth} loading={loading} />
        </LazyWidget>
        
        {/* Status-Widget */}
        <LazyWidget key="status" title="System-Status" placeholderHeight="250px">
          <StatusWidget statusStats={statusStats} loading={loading} />
        </LazyWidget>
        
        {/* Durchsatz-Widget */}
        <LazyWidget key="throughput" title="Durchsatz" placeholderHeight="250px">
          <ThroughputWidget throughput={throughput} statusData={filteredStatusData} loading={loading} />
        </LazyWidget>
        
        {/* Fehler-Zeit-Analyse-Widget */}
        <LazyWidget key="error-time" title="Fehler-Zeit-Analyse" placeholderHeight="250px">
          <ErrorTimeAnalysisWidget errorsByHour={errorsByHour} errorsByDay={errorsByDay} loading={loading} />
        </LazyWidget>
        
        {/* Fehler-Heatmap */}
        <LazyWidget key="error-heatmap" title="Fehler-Heatmap" placeholderHeight="400px">
          <ErrorHeatmapWidget 
            errorHeatmapData={errorHeatmap} 
            onFilterChange={handleErrorTypeChange}
            loading={loading}
          />
        </LazyWidget>
        
        {/* Datei-Zählungs-Widget - deaktiviert wegen Performance-Problemen */}
        {/* 
        <LazyWidget key="file-count" title="Datei-Zählung" placeholderHeight="250px">
          <FileCountWidget fileData={fileCountData} loading={loading} />
        </LazyWidget>
        */}
        
        {/* Muster-Widget */}
        <LazyWidget key="pattern-match" title="Muster-Analyse" placeholderHeight="250px">
          <PatternMatchWidget patternData={patternAnalysis} loading={loading} />
        </LazyWidget>
        
        {/* ErrorStackedLine-Widget */}
        <LazyWidget key="error-stacked-line" title="Fehlertypen-Verlauf" placeholderHeight="400px">
          <ErrorStackedLineWidget patternData={filteredPatternData} loading={loading} dateRange={dateRange} />
        </LazyWidget>
        
        {/* ErrorStackedBar-Widget */}
        <LazyWidget key="error-stacked-bar" title="Fehlertypen-Verteilung" placeholderHeight="400px">
          <ErrorStackedBarWidget patternData={filteredPatternData} loading={loading} />
        </LazyWidget>
        
        {/* Fehler-Widget */}
        <LazyWidget key="error-groups" title="Fehler-Analyse" placeholderHeight="250px">
          <ErrorWidget errorGroups={errorGroups} loading={loading} />
        </LazyWidget>
        
        {/* Fehlertypen-Treemap */}
        <LazyWidget key="error-treemap" title="Fehlertypen-Treemap" placeholderHeight="400px">
          <ErrorTreemapWidget patternData={filteredPatternData} loading={loading} />
        </LazyWidget>
        
        {/* Fehlerrate-Liniendiagramm */}
        <LazyWidget key="error-rate" title="Fehlerrate-Analyse" placeholderHeight="400px">
          <ErrorRateLineWidget systemHealth={systemHealth} statusData={filteredStatusData} loading={loading} />
        </LazyWidget>
        
        {/* Durchsatz-Liniendiagramm */}
        <LazyWidget key="throughput-line" title="Durchsatz-Analyse" placeholderHeight="400px">
          <ThroughputLineWidget statusData={filteredStatusData} loading={loading} />
        </LazyWidget>
      </DraggableWidgetGrid>
      
      {/* Zeitraum-Anzeige wurde in die FilterBar verschoben */}
    </DashboardLayout>
  );
}

export default App;
