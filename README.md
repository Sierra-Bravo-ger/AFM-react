# AFM Dashboard

Ein modernes React-Dashboard zur Visualisierung und Überwachung von Dateiverarbeitungsprozessen. Das AFM (AnyFileMonitor) Dashboard bietet eine Echtzeit-Ansicht von Dateibewegungen zwischen Input-, Archiv- und Error-Verzeichnissen sowie detaillierte Analysen zu Fehlertypen und Musterübereinstimmungen.

![AFM Dashboard Screenshot](./screenshot.png)

## Features

### Datenvisualisierung
- **Umfassende Metriken**: System-Gesundheit, Durchsatz, Fehlerraten und Musteranalysen
- **Interaktive Diagramme**: Linien-, Balken-, Heatmap- und Treemap-Visualisierungen
- **Detaillierte Fehleranalyse**: Gruppierung, Zeitverläufe und Verteilungen von Fehlern

### Benutzerinteraktion
- **Anpassbares Dashboard**: Drag & Drop-Funktionalität für alle Widgets
- **Zusammenklappbare Widgets**: Effiziente Platznutzung durch ein-/ausklappbare Elemente
- **Flexible Zeitfilterung**: Schwebendes Panel mit Schnellfiltern und präzisen Zeitfeldern

### Benutzeroberfläche
- **Responsives Design**: Optimierte Layouts für Desktop, Tablet und Mobile
- **Dark Mode Support**: Vollständige Unterstützung für helle und dunkle Themes
- **Optimierte Lazy-Loading**: Effiziente Ressourcennutzung durch intelligentes Laden

## Technologie-Stack

- **Frontend**: React.js mit Hooks und funktionalen Komponenten
- **Layout**: React Grid Layout für anpassbares Dashboard
- **Styling**: Tailwind CSS mit Dark Mode Support
- **Visualisierung**: Recharts für interaktive und responsive Diagramme
- **Performance**: Intersection Observer API für optimiertes Lazy Loading
- **Persistenz**: LocalStorage für Benutzereinstellungen und Layout
- **Build-Tool**: Vite für schnelle Entwicklung und Optimierung

## Installation

```bash
# Repository klonen
git clone https://github.com/yourusername/afm-react.git
cd afm-react

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## Datenquellen einrichten

Das Dashboard erwartet CSV-Dateien im `public/AFMlog/`-Verzeichnis. Diese sollten als symbolische Links zu den tatsächlichen CSV-Dateien eingerichtet werden:

```bash
# Beispiel für Windows (als Administrator ausführen)
mklink /D "C:\Projekte\afm-react\public\AFMlog" "C:\Transfer\LIS_Simulator\AFMlog"
```

## Detaillierte Dokumentation

Eine ausführliche Dokumentation des Projekts findet sich in der [Projekt_Doku.md](./Projekt_Doku.md).

## Lizenz und Verwendete Pakete

### Lizenz

Dieses Projekt ist unter der MIT-Lizenz veröffentlicht.

### Verwendete Hauptpakete

- **React.js** - [MIT](https://github.com/facebook/react/blob/main/LICENSE)
- **React Grid Layout** - [MIT](https://github.com/react-grid-layout/react-grid-layout/blob/master/LICENSE)
- **Recharts** - [MIT](https://github.com/recharts/recharts/blob/master/LICENSE)
- **Tailwind CSS** - [MIT](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE)
- **React Intersection Observer** - [MIT](https://github.com/thebuilder/react-intersection-observer/blob/master/LICENSE)

Eine vollständige Liste aller Abhängigkeiten und deren Lizenzen findet sich in der `package.json` Datei.
