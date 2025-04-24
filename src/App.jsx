import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import FilterBar from './components/layout/FilterBar';
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

import { loadCSVData } from './utils/DataLoader';
import { 
  calculateStatusStatistics, 
  groupErrorsByType, 
  countFilesByTimestamp, 
  analyzePatternMatches 
} from './utils/DataProcessor';

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
  const [statusStats, setStatusStats] = useState(null);
  const [errorGroups, setErrorGroups] = useState(null);
  const [fileCountData, setFileCountData] = useState(null);
  const [patternAnalysis, setPatternAnalysis] = useState(null);
  
  // State für erweiterte Metriken
  const [systemHealth, setSystemHealth] = useState(null);
  const [throughput, setThroughput] = useState(null);
  const [errorsByHour, setErrorsByHour] = useState(null);
  const [errorsByDay, setErrorsByDay] = useState(null);
  const [errorHeatmap, setErrorHeatmap] = useState(null);
  
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
    const newErrorHeatmap = createErrorHeatmap(filteredError);
    
    // Erweiterte Metriken aktualisieren
    setSystemHealth(newSystemHealth);
    setThroughput(newThroughput);
    setErrorsByHour(newErrorsByHour);
    setErrorsByDay(newErrorsByDay);
    setErrorHeatmap(newErrorHeatmap);
  }, [dateRange, statusData, errorData, inputData, patternData, filterDataByDateRange]);
  
  return (
    <DashboardLayout>
      {/* Zeitraum-Filter */}
      <div className="col-span-full mb-6">
        <FilterBar 
          onFilterChange={handleFilterChange} 
          minDate={minMaxDates.minDate} 
          maxDate={minMaxDates.maxDate}
          currentDateRange={dateRange}
        />
      </div>
      
      {/* System-Gesundheit und Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* System-Gesundheit-Widget */}
        <div>
          <SystemHealthWidget systemHealth={systemHealth} loading={loading} />
        </div>
        
        {/* Status-Widget */}
        <div>
          <StatusWidget statusStats={statusStats} loading={loading} />
        </div>
      </div>
      
      {/* Durchsatz und Fehleranalyse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Durchsatz-Widget */}
        <div>
          <ThroughputWidget throughput={throughput} statusData={filteredStatusData} loading={loading} />
        </div>
        
        {/* Fehler-Zeit-Analyse-Widget */}
        <div>
          <ErrorTimeAnalysisWidget errorsByHour={errorsByHour} errorsByDay={errorsByDay} loading={loading} />
        </div>
      </div>
      
      {/* Fehler-Heatmap */}
      <div className="mb-6">
        <ErrorHeatmapWidget errorHeatmap={errorHeatmap} loading={loading} />
      </div>
      
      {/* Datei-Zählungs-Widget */}
      <div className="mb-6">
        <FileCountWidget fileData={fileCountData} loading={loading} />
      </div>
      
      {/* Muster-Widget */}
      <div className="mb-6">
        <PatternMatchWidget patternData={patternAnalysis} loading={loading} />
      </div>
      
      {/* ErrorStackedLine-Widget */}
      <div className="mb-6">
        <ErrorStackedLineWidget patternData={filteredPatternData} loading={loading} dateRange={dateRange} />
      </div>
      
      {/* ErrorStackedBar-Widget */}
      <div className="mb-6">
        <ErrorStackedBarWidget patternData={filteredPatternData} loading={loading} />
      </div>
      
      {/* Fehler-Widget */}
      <div className="mb-6">
        <ErrorWidget errorGroups={errorGroups} loading={loading} />
      </div>
      
      {/* Zeitraum-Anzeige wurde in die FilterBar verschoben */}
    </DashboardLayout>
  );
}

export default App;
