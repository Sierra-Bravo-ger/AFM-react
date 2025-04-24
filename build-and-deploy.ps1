# Windows Build and Deploy
# Standard-Build und Server starten (nur lokaler Zugriff)
#  .\build-and-deploy.ps1

# Mit externem Zugriff
#  .\build-and-deploy.ps1 -ExternalAccess

# Mit benutzerdefiniertem Port
#  .\build-and-deploy.ps1 -PortNumber 3000

# Mit benutzerdefiniertem Quellverzeichnis für die CSV-Dateien
#  .\build-and-deploy.ps1 -SourceDataPath "D:\MeineDateien\AFMlog"

# Nur Build ohne Server-Start
#  .\build-and-deploy.ps1 -RunServer:$false
param(
    [switch]$ExternalAccess,
    [int]$PortNumber = 7188,
    [string]$SourceDataPath = "C:\Transfer\LIS_Simulator\AFMlog",
    [switch]$RunServer = $true
)

$host.UI.RawUI.WindowTitle = "AFM Dashboard Build & Deploy"

# Farben für die Ausgabe
$colorInfo = "Cyan"
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"

function Write-Step {
    param([string]$Message)
    Write-Host "► $Message" -ForegroundColor $colorInfo
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $colorSuccess
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $colorWarning
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $colorError
}

# Prüfen, ob das Quellverzeichnis existiert
if (-not (Test-Path $SourceDataPath)) {
    Write-Error "Das Quellverzeichnis '$SourceDataPath' existiert nicht!"
    exit 1
}

# Projektverzeichnis
$projectDir = $PSScriptRoot
$distDir = Join-Path $projectDir "dist"
$dataDir = Join-Path $distDir "AFMlog"

# Build starten
Write-Host "AFM Dashboard Build & Deploy" -ForegroundColor $colorInfo
Write-Host "===========================" -ForegroundColor $colorInfo
Write-Host ""

# 1. Build ausführen
Write-Step "Führe npm build aus..."
try {
    Push-Location $projectDir
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build fehlgeschlagen mit Exit-Code $LASTEXITCODE"
        exit 1
    }
    Write-Success "Build erfolgreich abgeschlossen"
} catch {
    Write-Error "Fehler beim Build: $_"
    exit 1
} finally {
    Pop-Location
}

# 2. Datenverzeichnis erstellen und Dateien kopieren
Write-Step "Kopiere CSV-Dateien aus $SourceDataPath..."
try {
    # Datenverzeichnis erstellen, falls es nicht existiert
    if (-not (Test-Path $dataDir)) {
        New-Item -Path $dataDir -ItemType Directory -Force | Out-Null
    }
    
    # CSV-Dateien kopieren
    $csvFiles = @(
        "AFM_status_log.csv",
        "AFM_error_log.csv", 
        "AFM_input_details.csv", 
        "AFM_pattern_matches.csv"
    )
    
    foreach ($file in $csvFiles) {
        $sourcePath = Join-Path $SourceDataPath $file
        $targetPath = Join-Path $dataDir $file
        
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Success "Datei kopiert: $file"
        } else {
            Write-Warning "Datei nicht gefunden: $file"
        }
    }
} catch {
    Write-Error "Fehler beim Kopieren der Dateien: $_"
    exit 1
}

# 3. Einfachen Produktionsserver erstellen
if ($RunServer) {
    # Server-Datei erstellen
    $serverFilePath = Join-Path $distDir "server.js"
    $serverContent = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || $PortNumber;
const EXTERNAL_ACCESS = $($ExternalAccess.ToString().ToLower());

// MIME-Typen für verschiedene Dateitypen
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
  console.log(`\${new Date().toISOString()} - \${req.method} \${req.url}`);
  
  // URL normalisieren
  let url = req.url;
  
  // Wenn die URL mit einem / endet oder keine Erweiterung hat, index.html verwenden (SPA-Routing)
  if (url.endsWith('/') || !path.extname(url)) {
    url = '/index.html';
  }
  
  // Dateipfad bestimmen
  const filePath = path.join(__dirname, url);
  const extname = path.extname(filePath).toLowerCase();
  
  // MIME-Typ bestimmen
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Datei lesen und senden
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Wenn die Datei nicht gefunden wurde, aber es eine HTML-Anfrage ist, index.html zurückgeben (SPA-Routing)
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
          fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
              res.writeHead(500);
              res.end('Error loading index.html');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content, 'utf-8');
            }
          });
        } else {
          // Für andere Dateitypen 404 zurückgeben
          res.writeHead(404);
          res.end('File not found');
        }
      } else {
        // Serverfehler
        res.writeHead(500);
        res.end(`Server Error: \${err.code}`);
      }
    } else {
      // Erfolgreiche Antwort
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Server starten
const host = EXTERNAL_ACCESS ? '0.0.0.0' : 'localhost';
server.listen(PORT, host, () => {
  console.log(`Server läuft auf http://\${host === '0.0.0.0' ? 'localhost' : host}:\${PORT}/`);
  console.log(`Externer Zugriff: \${EXTERNAL_ACCESS ? 'Ja' : 'Nein'}`);
  console.log('Drücken Sie Strg+C zum Beenden');
});
"@
    
    # Server-Datei schreiben
    Set-Content -Path $serverFilePath -Value $serverContent
    
    # package.json für den Server erstellen
    $packageJsonPath = Join-Path $distDir "package.json"
    $packageJsonContent = @"
{
  "name": "afm-dashboard-server",
  "version": "1.0.0",
  "description": "Produktionsserver für das AFM Dashboard",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {}
}
"@
    
    Set-Content -Path $packageJsonPath -Value $packageJsonContent
    
    # Server starten
    Write-Step "Starte Produktionsserver..."
    Write-Host "Port: $PortNumber" -ForegroundColor $colorInfo
    Write-Host "Externer Zugriff: $(if ($ExternalAccess) { 'Ja' } else { 'Nein' })" -ForegroundColor $colorInfo
    Write-Host ""
    Write-Host "Dashboard ist verfügbar unter: http://localhost:$PortNumber/" -ForegroundColor $colorSuccess
    Write-Host "Drücken Sie Strg+C zum Beenden" -ForegroundColor $colorInfo
    Write-Host ""
    
    try {
        Push-Location $distDir
        node server.js
    } catch {
        Write-Error "Fehler beim Starten des Servers: $_"
        exit 1
    } finally {
        Pop-Location
    }
} else {
    Write-Success "Build und Deployment abgeschlossen"
    Write-Host ""
    Write-Host "Um den Server zu starten, wechseln Sie in das dist-Verzeichnis und führen Sie aus:" -ForegroundColor $colorInfo
    Write-Host "  cd dist" -ForegroundColor $colorInfo
    Write-Host "  node server.js" -ForegroundColor $colorInfo
    Write-Host ""
    Write-Host "Das Dashboard wird dann verfügbar sein unter: http://localhost:$PortNumber/" -ForegroundColor $colorSuccess
}
