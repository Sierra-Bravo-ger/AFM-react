import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import FilterBar from './components/layout/FilterBar';
import StatusWidget from './components/widgets/StatusWidget';
import ErrorWidget from './components/widgets/ErrorWidget';
import FileCountWidget from './components/widgets/FileCountWidget';
import PatternMatchWidget from './components/widgets/PatternMatchWidget';
import ErrorStackedLineWidget from './components/widgets/ErrorStackedLineWidget';
import { loadCSVData } from './utils/DataLoader';
import { 
  calculateStatusStatistics, 
  groupErrorsByType, 
  countFilesByTimestamp, 
  analyzePatternMatches 
} from './utils/DataProcessor';
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
    setStatusStats(calculateStatusStatistics(filteredStatus));
    setErrorGroups(groupErrorsByType(filteredError));
    setFileCountData(countFilesByTimestamp(filteredInput));
    setPatternAnalysis(analyzePatternMatches(filteredPattern));
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
      
      {/* Status-Widget */}
      <div className="mb-6">
        <StatusWidget statusStats={statusStats} loading={loading} />
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
      
      {/* Fehler-Widget */}
      <div className="mb-6">
        <ErrorWidget errorGroups={errorGroups} loading={loading} />
      </div>
      
      {/* Zeitraum-Anzeige */}
      {dateRange.startDate && dateRange.endDate && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center text-sm text-blue-800 dark:text-blue-200">
          Daten gefiltert von {dateRange.startDate.toLocaleDateString()} bis {dateRange.endDate.toLocaleDateString()}
        </div>
      )}
    </DashboardLayout>
  );
}

export default App;
