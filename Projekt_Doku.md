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

### 2. FloatingTimelinePanel

Ermöglicht die Filterung aller Dashboard-Daten nach Zeitraum in einem schwebenden, frei positionierbaren Panel:

- Schnellfilter-Buttons (5m, 15m, 1h, 4h, 8h, 12h, 16h, 1d, 7d, 14d, 30d)
- Datums- und Uhrzeitfelder für präzise Filterung
- Integrierter TimelineSlider für visuelle Zeitraumauswahl
- Minimierbar und frei auf dem Dashboard positionierbar
- Anzeige der aktuellen Zeitspanne als menschenlesbarer Text
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
- Gruppierung nach Fehlertypen (stündlich oder täglich)
- Dynamische X-Achsen-Anpassung je nach Zeitraum
- Interaktive Legende zum Ein-/Ausblenden von Fehlertypen

### 6. ThroughputLineWidget

Visualisiert den Durchsatz (verarbeitete Dateien pro Stunde) über Zeit:

- Liniendiagramm mit Trendanzeige
- Dynamische X-Achsen-Anpassung (stündlich/täglich)
- Automatische Gruppierung je nach ausgewähltem Zeitraum
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
6. **Interaktive Zeitfilterung**: Intuitive Zeitraumauswahl mit schwebendem, frei positionierbarem Panel
7. **Konsistente Diagramm-Darstellung**: Einheitliche Hintergründe und Styling für alle Visualisierungen
8. **Dynamische Diagramm-Anpassung**: Automatische Anpassung der X-Achsen und Gruppierung je nach Zeitraum
9. **Lazy Loading**: Widgets werden erst geladen, wenn sie im sichtbaren Bereich sind, für verbesserte Performance
10. **Anpassbares Dashboard**: Widgets können per Drag & Drop frei angeordnet werden

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

## Performance-Optimierungen

### Lazy Loading für Widgets

Das Dashboard verwendet Lazy Loading für alle Widgets, um die Ladezeit und Performance zu verbessern:

- **LazyWidget-Komponente**:
  - Nutzt die Intersection Observer API, um zu erkennen, wann Widgets im sichtbaren Bereich sind
  - Rendert Platzhalter mit Lade-Animation, bis das Widget sichtbar wird
  - Reduziert die initiale Ladezeit und CPU-/Speicherauslastung

- **Implementierung**:
  - Basiert auf der react-intersection-observer-Bibliothek
  - Konfigurierbare Parameter wie threshold, rootMargin und placeholderHeight
  - Automatisches Laden mit kleiner Verzögerung für bessere UX

- **Vorteile**:
  - Schnelleres initiales Rendering der Seite
  - Reduzierte Ressourcennutzung, besonders bei vielen komplexen Diagrammen
  - Verbesserte Benutzererfahrung durch progressives Laden

### Anpassbares Dashboard mit Drag & Drop

Das Dashboard bietet eine vollständig anpassbare Benutzeroberfläche mit Drag & Drop-Funktionalität:

- **DraggableWidgetGrid-Komponente**:
  - Basiert auf react-grid-layout für responsive, anpassbare Layouts
  - Widgets können frei positioniert und in der Größe verändert werden
  - Automatische Anpassung an verschiedene Bildschirmgrößen (Desktop, Tablet, Smartphone)

- **Persistenz**:
  - Layout-Konfigurationen werden im LocalStorage gespeichert
  - Benutzerdefinierte Anordnungen bleiben auch nach dem Neuladen erhalten
  - Standardlayouts für Erstbenutzer oder bei fehlender gespeicherter Konfiguration

- **Benutzerfreundlichkeit**:
  - Intuitive Drag-Handles für einfaches Verschieben
  - Visuelles Feedback während des Ziehens
  - Kompakte Anordnung ohne Überlappungen

## Neue Funktionen & Verbesserungen

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

### TimelineSlider & FloatingTimelinePanel

Der TimelineSlider ist eine interaktive Komponente zur visuellen Zeitraumauswahl, die in das FloatingTimelinePanel integriert wurde:

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
  - Keine Cursor-Sprünge mehr beim Ziehen über Beschriftungen

- **FloatingTimelinePanel-Features**:
  - Frei positionierbares Panel mit Drag & Drop-Funktionalität
  - Minimierbar mit Anzeige der aktuellen Zeitspanne im minimierten Zustand
  - Erweiterte Schnellfilter-Buttons (5m, 15m, 1h, 4h, 8h, 16h, 1d, 7d, 14d, 30d)
  - Kompaktes 2x2 Grid für Datum/Zeit-Eingabefelder mit einheitlicher Breite
  - Menschenlesbare Anzeige der aktuellen Zeitspanne (z.B. "8 Tage 9 Std. 3 Min.")
  - Immer im Vordergrund für schnellen Zugriff auf die Zeitfilterung

- **Draggable Handles**: Start- und Endzeit können durch Ziehen der Handles angepasst werden
- **Bereichsauswahl**: Der ausgewählte Bereich zwischen den Handles kann als Ganzes verschoben werden
- **Intuitive Bedienung**: Hand-Cursor (grab/grabbing) für bessere Benutzerführung
- **Verzögerte Aktualisierung**: Filterung wird erst beim Loslassen der Handles ausgelöst
- **Synchronisation**: Nahtlose Integration mit Datumseingabefeldern und Schnellfiltern
- **Touch-Unterstützung**: Optimiert für mobile Geräte mit zuverlässiger Touch-Bedienung
- **Adaptive Markerdichte**: Automatische Anpassung der Zeitmarker-Anzahl je nach Bildschirmbreite

### Zeitraum-Navigation & Dynamische Diagramme

Die Zeitraum-Navigation ermöglicht eine effiziente Analyse aufeinanderfolgender Zeitabschnitte:

- **Zeitraum-Verschiebungs-Buttons**: "Zurück" und "Weiter" Buttons zum Verschieben des Zeitraums
- **Intelligente Zeitspannen-Berechnung**: Verschiebung um exakt die aktuelle Zeitspanne (z.B. 8 Stunden)
- **Grenzen-Respektierung**: Automatische Anpassung an min/max-Datumsgrenzen
- **Konsistente Zeitspannen**: Beibehaltung der exakten Zeitspanne bei Verschiebung

**Dynamische X-Achsen für Diagramme**:

- **Intelligente Zeitraumanpassung**: Automatische Erkennung des Zeitraums und Anpassung der X-Achse
- **Adaptive Gruppierung**: Stündliche Gruppierung für kurze Zeiträume (≤ 2 Tage), tägliche Gruppierung für längere Zeiträume
- **Optimierte Beschriftung**: Automatische Anpassung der X-Achsenbeschriftung je nach Zeitraum
- **Rotierte Labels**: Schräge Beschriftungen bei vielen Datenpunkten für bessere Lesbarkeit
- **Konsistente Implementierung**: Gleiche Logik in allen Diagrammen (ErrorRate, Throughput, ErrorStackedLine)

### UI-Verbesserungen

- **Responsives Design**: Optimierte Layouts für Desktop und mobile Geräte
- **Optimierte Datumseingabe**: Kompaktes 2x2 Grid für Datum/Zeit-Eingabefelder mit einheitlicher Breite
- **Verbesserte Diagramme**: Volle Breite für Heatmap und optimierte Layouts für Donut-Diagramme
- **Verbesserte Fehlertypen-Darstellung**: Korrekte Darstellung von Umlauten und bessere Lesbarkeit
- **Moderne Benutzeroberfläche**: Klare visuelle Hierarchie und intuitive Bedienelemente
- **Optimierter Header**: Anpassungsfähiges Layout für Status-Badges und Zeitangaben
- **Korrigiertes Root-Element-Styling**: Entfernung des unerwünschten Paddings aus der Vite-Standardvorlage
- **Schwebendes Zeitraum-Panel**: Immer zugängliche Zeitfilterung ohne Platzverlust im Dashboard
- **Optimiertes Dashboard-Grid**: Anpassbares 12-Spalten-Layout mit Drag & Drop-Funktionalität

### Optimiertes Dashboard-Grid mit 12-Spalten-System

Das Dashboard wurde mit einem flexiblen 12-Spalten-Grid implementiert, das eine optimale Verteilung der Widgets ermöglicht:

#### Technische Implementierung

- **React-Grid-Layout**: Verwendung der Bibliothek für Drag & Drop und responsive Layouts
- **12-Spalten-System**: Optimale Breite für Desktop (lg), 2 Spalten für Tablet (md), 1 Spalte für Mobilgeräte (sm/xs)
- **Optimierte Zeilenbasierte Höhe**: Zeileneinheit von 15px für noch feinere Kontrolle über Widget-Größen
- **Verbesserte Abstands-Konfiguration**: Optimierte Container-Paddings (15px) und Margins (15px) für effizientere Raumnutzung
- **LocalStorage-Persistenz**: Speicherung der benutzerdefinierten Anordnung und des Collapse-Status
- **Konsistente Widget-IDs**: Verwendung von Präfix-IDs ('.$widget-name') für zuverlässige Speicherung

#### Layout-Optimierungen

- **Optimierte Widget-Größen**: Große Diagramme nutzen volle Breite (12 Spalten), kleinere Widgets optimal verteilt
- **Präzise Höhenkontrolle**: Widgets mit fein abgestuften Höhen je nach Inhalt (z.B. h: 38 für komplexe Diagramme)
- **Automatische Kompaktierung**: Keine Überlappungen und optimale Raumnutzung
- **Responsive Anpassung**: Automatische Neuanordnung bei verschiedenen Bildschirmgrößen mit konsistenten Höhen

#### Erweiterte Funktionalität

- **Zusammenklappbare Widgets**: Widgets können ein- und ausgeklappt werden
- **Effiziente Höhenanpassung**: Eingeklappte Widgets haben eine Höhe von exakt 2 Einheiten (30px)
- **Persistenter Collapse-Status**: Der Zustand (ein-/ausgeklappt) wird im LocalStorage gespeichert
- **Klare Trennung von Drag & Drop und Collapse**: Dedizierter Drag-Handle-Bereich (75% der Widget-Breite) und separater Bereich für den Collapse-Button

#### Benutzerfreundlichkeit

- **Intuitive Drag & Drop-Steuerung**: Widgets können frei positioniert werden
- **Verbesserte Resize-Handles**: Optimierte Sichtbarkeit im Dark Mode mit Hover-Effekten
- **Layout-Reset-Funktion**: Möglichkeit, zur Standardanordnung zurückzukehren
- **Visuelles Feedback**: Hinweise zur Drag & Drop-Funktionalität im Info-Panel
- **Robuste Fehlerbehandlung**: Fallback auf Standardlayout bei Problemen

#### Optimiertes Lazy Loading

- **Robuster Lazy-Loading-Mechanismus**: Garantierte Anzeige aller Widgets durch Fallback-Timer
- **Verbesserte Intersection Observer-Konfiguration**: Optimierte Erkennung in Grid-Layouts
- **Debugging-Informationen**: Erweiterte Datenattribute und Fehleranzeigen für einfachere Diagnose

### CSS-Anpassungen

#### Korrektur des Root-Element-Paddings

Bei der Erstellung einer React-Anwendung mit Vite wird standardmäßig eine `App.css`-Datei generiert, die ein Padding von 2rem (32px) für das Root-Element definiert:

```css
/* Ursprüngliche CSS-Regel aus der Vite-Vorlage */
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
```

Dieses Padding verursacht unerwünschte Abstände um die gesamte Anwendung, insbesondere am oberen Rand, was für ein Dashboard nicht optimal ist. Die Lösung bestand darin, folgende Anpassungen vorzunehmen:

```css
/* Angepasste CSS-Regel */
#root {
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  text-align: center;
}
```

Diese Änderungen bewirken:
- Kein Abstand mehr um die Hauptanwendung
- Die Anwendung nutzt die volle Breite des Bildschirms
- Das Dashboard kann nahtlos bis zum Rand des Fensters angezeigt werden

Diese Optimierung verbessert die Nutzung des verfügbaren Bildschirmplatzes und sorgt für ein konsistenteres Layout des Dashboards.
