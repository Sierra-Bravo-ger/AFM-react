❯ npm create vite@latest afm-react -- --template react

> npx
> create-vite afm-react react

│
◇  Select a framework:
│  React
│
◇  Select a variant:
│  JavaScript
│
◇  Scaffolding project in C:\Projekte\afm-react...
│
└  Done. Now run:

  cd afm-react
  npm install
  npm run dev

 sebas@Sebbe-PC  C:  Projekte 
❯ cd afm-react
 sebas@Sebbe-PC  C:  Projekte  afm-react 
❯ npm install

added 152 packages, and audited 153 packages in 6s

32 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

 sebas@Sebbe-PC  C:  Projekte  afm-react 
❯ npm install -D tailwindcss@^3 postcss autoprefixer

added 95 packages, and audited 248 packages in 2s

60 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
 sebas@Sebbe-PC  C:  Projekte  afm-react 
❯ npx tailwindcss init -p

Created Tailwind CSS config file: tailwind.config.js
Created PostCSS config file: postcss.config.js


# AFM Dashboard - Dokumentation

## Übersicht

Das AFM (AnyFileMonitor) Dashboard ist eine React-Anwendung zur Visualisierung und Überwachung von Dateiverarbeitungsprozessen. Es bietet eine Echtzeit-Ansicht von Dateibewegungen zwischen Input-, Archiv- und Error-Verzeichnissen sowie detaillierte Analysen zu Fehlertypen und Musterübereinstimmungen.

## Technologie-Stack

- **Frontend**: React.js mit Hooks
- **Styling**: Tailwind CSS mit Dark Mode Support
- **Visualisierung**: Recharts für interaktive Diagramme
- **Datenverarbeitung**: Clientseitige CSV-Verarbeitung

## Projektstruktur

```
afm-react/
├── public/
│   └── AFMlog/       # Symbolische Links zu CSV-Dateien aus dem Backend
├── src/
│   ├── components/
│   │   ├── layout/   # Layout-Komponenten (Header, FilterBar, WidgetCard)
│   │   └── widgets/  # Dashboard-Widgets (Status, Error, FileCount, etc.)
│   ├── utils/        # Hilfsfunktionen (DataLoader, DataProcessor)
│   ├── App.jsx       # Hauptkomponente
│   └── index.js      # Einstiegspunkt
└── package.json      # Abhängigkeiten
```

## Datenquellen

Das Dashboard verarbeitet vier CSV-Dateien, die über symbolische Links aus dem Backend eingebunden werden:

1. **AFM_status_log.csv**: Enthält Statusdaten mit Spalten für Input, Archiv und Error (Anzahl der Dateien in den jeweiligen Verzeichnissen)
2. **AFM_error_log.csv**: Detaillierte Fehlerinformationen mit Fehlertyp, Zeitpunkt und Beschreibung
3. **AFM_input_details.csv**: Informationen zu verarbeiteten Input-Dateien
4. **AFM_pattern_matches.csv**: Daten zu Musterübereinstimmungen in den verarbeiteten Dateien

## Hauptkomponenten

### 1. WidgetCard

Eine wiederverwendbare Komponente, die als Basis für alle Dashboard-Widgets dient. Features:

- Einheitliches Design mit Schatten und Rundungen
- Collapsible-Funktion zum Ein-/Ausklappen von Inhalten
- Header mit Titel, Icon und Action-Buttons
- Vollständiger Dark Mode Support

### 2. FilterBar

Ermöglicht die Filterung aller Dashboard-Daten nach Zeitraum:

- Schnellfilter-Buttons (5m, 15m, 1h, 4h, 8h, 12h, 1d, 7d, 30d)
- Datums- und Uhrzeitfelder für präzise Filterung
- Synchronisierte Aktualisierung aller Widgets

### 3. StatusWidget

Zeigt den aktuellen Systemstatus mit folgenden Informationen:

- Aktuelle Anzahl der Dateien in Input, Archiv und Error
- Vergleich mit Werten zu Beginn des ausgewählten Zeitraums
- Differenzanzeige mit farblicher Hervorhebung (positiv/negativ)
- Balkendiagramm zur Visualisierung der Verteilung

### 4. ErrorWidget

Analysiert und gruppiert Fehler nach Typ:

- Fehlerverteilung nach Kategorien
- Detaillierte Fehlerinformationen
- Farbliche Differenzierung nach Fehlertyp

### 5. ErrorStackedLineWidget

Zeigt den zeitlichen Verlauf von Fehlern als gestapeltes Flächendiagramm:

- Fehlerentwicklung über Zeit
- Gruppierung nach Fehlertypen
- Interaktive Legende zum Ein-/Ausblenden von Fehlertypen

### 6. FileCountWidget

Visualisiert die Anzahl der verarbeiteten Dateien über Zeit:

- Liniendiagramm mit Trendanzeige
- Filterung nach Zeitraum

### 7. PatternMatchWidget

Zeigt Musterübereinstimmungen in den verarbeiteten Dateien:

- Kreisdiagramm mit prozentualer Verteilung
- Detaillierte Aufschlüsselung der Muster
- Beispiele für Musterübereinstimmungen

## Datenverarbeitung

### DataLoader.jsx

Verantwortlich für das Laden und Parsen der CSV-Dateien:

- Asynchrones Laden der Dateien
- Parsing mit Semikolon-Trennung
- Konvertierung in JavaScript-Objekte

### DataProcessor.jsx

Verarbeitet die geladenen Daten für die verschiedenen Widgets:

- `calculateStatusStatistics`: Berechnet Start- und Endwerte sowie Differenzen im ausgewählten Zeitraum
- `groupErrorsByType`: Gruppiert Fehler nach Typ für das ErrorWidget
- `countFilesByTimestamp`: Aggregiert Dateizählungen nach Zeitstempel
- `analyzePatternMatches`: Analysiert Musterübereinstimmungen

## Besonderheiten & Best Practices

1. **Robuste Datenverarbeitung**: Umgang mit fehlenden Werten und Formatierungsproblemen (z.B. Umlaute in Mustertypen)
2. **Responsive Design**: Anpassung an verschiedene Bildschirmgrößen
3. **Dark Mode**: Vollständige Unterstützung für helles und dunkles Design
4. **Modulare Struktur**: Wiederverwendbare Komponenten und klare Trennung von Datenverarbeitung und Darstellung
5. **Einheitliches Design**: Konsistente Farben, Abstände und Animationen
6. **Interaktive Zeitfilterung**: Intuitive Zeitraumauswahl mit draggable Timeline-Slider
7. **Konsistente Diagramm-Darstellung**: Einheitliche Hintergründe und Styling für alle Visualisierungen

## Entwicklung & Erweiterung

### Lokale Entwicklung

1. Repository klonen
2. Abhängigkeiten installieren: `npm install`
3. Symbolische Links zu CSV-Dateien erstellen
4. Entwicklungsserver starten: `npm run dev`

### Neue Widgets hinzufügen

1. Neue Widget-Komponente erstellen, die WidgetCard verwendet
2. Datenverarbeitung in DataProcessor.jsx implementieren
3. Widget in App.jsx einbinden
4. Styling mit Tailwind CSS anpassen

## Bekannte Einschränkungen

- CSV-Dateien müssen im erwarteten Format vorliegen
- Symbolische Links müssen manuell eingerichtet werden
- Keine Serverkomponente für Echtzeit-Push-Benachrichtigungen

## Neue Funktionen

### SystemHealthWidget

Das SystemHealthWidget bietet eine intuitive und farbkodierte Visualisierung der Systemgesundheit:

- **GaugeChart für HealthScore**:
  - Halbkreisförmiges Gauge mit dynamischer Farbkodierung (grün, hellgrün, gelb, rot)
  - Prozentwert am unteren Rand des Charts in passender Farbe mit Schattenwurf für bessere Lesbarkeit
  - Responsive Anpassung an verschiedene Größen und automatische Anpassung an helles/dunkles Farbschema

- **Statusindikatoren**:
  - Übersichtliche Darstellung von Fehlerrate, Durchsatz, Fehlertrend und Datei-Eingang
  - Farbkodierte Statusanzeige (grün, gelb, rot) mit dynamischen Schwellenwerten
  - Datei-Eingang-Indikator mit drei Zuständen: Aktiv (grün), Dateistau (rot), Inaktiv (gelb)

### TimelineSlider

Der TimelineSlider ist eine interaktive Komponente zur visuellen Zeitraumauswahl mit folgenden Funktionen:

- **Präzise Zeitraumauswahl**:
  - Schlankere Handles (16px statt 24px) für präzisere Positionierung
  - Zentrierte Positionierung der Handles mit `transform: translateX(-50%)`
  - Visuelles Feedback durch einen feinen weißen Strich in der Mitte der Handles
  - Mindestabstand zwischen Handles auf 8px reduziert

- **Optimierter Track**:
  - Eckige Kanten für korrekte Ausrichtung der Zeitmarker-Beschriftungen
  - Zeitmarker mit `pointerEvents: 'none'` für konsistentes Cursor-Verhalten

- **Verbesserte Benutzerfreundlichkeit**:
  - Konsistentes Cursor-Verhalten beim Ziehen durch CSS-Klassen statt DOM-Manipulation
  - Optimierte Touch-Unterstützung für mobile Geräte

- **Draggable Handles**: Start- und Endzeit können durch Ziehen der Handles angepasst werden
- **Bereichsauswahl**: Der ausgewählte Bereich zwischen den Handles kann als Ganzes verschoben werden
- **Intuitive Bedienung**: Hand-Cursor (grab/grabbing) für bessere Benutzerführung
- **Verzögerte Aktualisierung**: Filterung wird erst beim Loslassen der Handles ausgelöst
- **Synchronisation**: Nahtlose Integration mit Datumseingabefeldern und Schnellfiltern
- **Touch-Unterstützung**: Optimiert für mobile Geräte mit zuverlässiger Touch-Bedienung
- **Adaptive Markerdichte**: Automatische Anpassung der Zeitmarker-Anzahl je nach Bildschirmbreite

### Zeitraum-Navigation

Die Zeitraum-Navigation ermöglicht eine effiziente Analyse aufeinanderfolgender Zeitabschnitte:

- **Zeitraum-Verschiebungs-Buttons**: "Zurück" und "Weiter" Buttons zum Verschieben des Zeitraums
- **Intelligente Zeitspannen-Berechnung**: Verschiebung um exakt die aktuelle Zeitspanne (z.B. 8 Stunden)
- **Grenzen-Respektierung**: Automatische Anpassung an min/max-Datumsgrenzen
- **Konsistente Zeitspannen**: Beibehaltung der exakten Zeitspanne bei Verschiebung

### UI-Verbesserungen

- **Responsives Design**: Optimierte Layouts für Desktop und mobile Geräte
- **Optimierte Datumseingabe**: Kompaktes 2x2 Grid für Datum/Zeit-Eingabefelder mit einheitlicher Breite
- **Verbesserte Diagramme**: Volle Breite für Heatmap und optimierte Layouts für Donut-Diagramme
- **Verbesserte Fehlertypen-Darstellung**: Korrekte Darstellung von Umlauten und bessere Lesbarkeit
- **Moderne Benutzeroberfläche**: Klare visuelle Hierarchie und intuitive Bedienelemente
- **Optimierter Header**: Anpassungsfähiges Layout für Status-Badges und Zeitangaben
