# AFM Dashboard

Ein modernes React-Dashboard zur Visualisierung und Überwachung von Dateiverarbeitungsprozessen. Das AFM (AnyFileMonitor) Dashboard bietet eine Echtzeit-Ansicht von Dateibewegungen zwischen Input-, Archiv- und Error-Verzeichnissen sowie detaillierte Analysen zu Fehlertypen und Musterübereinstimmungen.

![AFM Dashboard Screenshot](./screenshot.png)

## Features

- **Echtzeit-Überwachung** von Dateiverarbeitungsprozessen
- **Interaktive Widgets** für verschiedene Aspekte des Monitorings
- **Flexible Zeitfilterung** mit Schnellfiltern und präzisen Datums-/Uhrzeitfeldern
- **Dark Mode Support** für alle Komponenten
- **Responsive Design** für verschiedene Bildschirmgrößen

## Technologie-Stack

- **Frontend**: React.js mit Hooks
- **Styling**: Tailwind CSS
- **Visualisierung**: Recharts für interaktive Diagramme
- **Build-Tool**: Vite

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

## Lizenz

MIT
