# Standard-Build und Start (nur lokaler Zugriff)
#  .\docker-build-and-run.ps1

# Mit externem Zugriff
#  .\docker-build-and-run.ps1 -ExternalAccess

# Mit benutzerdefiniertem Port
#  .\docker-build-and-run.ps1 -Port 8080

# Mit benutzerdefiniertem AFM-Log-Pfad
#  .\docker-build-and-run.ps1 -AfmLogPath "D:\MeineDateien\AFMlog"

# Image neu bauen (ohne Cache)
#  .\docker-build-and-run.ps1 -RebuildImage
param(
    [switch]$ExternalAccess,
    [int]$Port = 7188,
    [string]$AfmLogPath = "C:\Transfer\LIS_Simulator\AFMlog",
    [switch]$RebuildImage = $false
)

$host.UI.RawUI.WindowTitle = "AFM Dashboard Docker Build & Run"

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

# Prüfen, ob Docker installiert ist
try {
    $dockerVersion = docker --version
    Write-Success "Docker gefunden: $dockerVersion"
} catch {
    Write-Error "Docker ist nicht installiert oder nicht im PATH. Bitte installieren Sie Docker Desktop."
    exit 1
}

# Prüfen, ob das AFM-Log-Verzeichnis existiert
if (-not (Test-Path $AfmLogPath)) {
    Write-Warning "Das AFM-Log-Verzeichnis '$AfmLogPath' existiert nicht. Der Container wird ohne Daten gestartet."
}

# Umgebungsvariablen für Docker Compose setzen
$env:PORT = $Port
$env:AFM_LOG_PATH = $AfmLogPath

# Projektverzeichnis
$projectDir = $PSScriptRoot

Write-Host "AFM Dashboard Docker Build & Run" -ForegroundColor $colorInfo
Write-Host "===============================" -ForegroundColor $colorInfo
Write-Host ""
Write-Host "Port: $Port" -ForegroundColor $colorInfo
Write-Host "AFM-Log-Pfad: $AfmLogPath" -ForegroundColor $colorInfo
Write-Host "Externer Zugriff: $(if ($ExternalAccess) { 'Ja' } else { 'Nein' })" -ForegroundColor $colorInfo
Write-Host ""

# Docker-Netzwerk-Konfiguration für externen Zugriff
if ($ExternalAccess) {
    Write-Step "Konfiguriere Docker für externen Zugriff..."
    # Diese Einstellung wird über die Port-Bindung in docker-compose.yml gesteuert
    # und benötigt keine zusätzliche Konfiguration
}

# Docker-Image bauen
if ($RebuildImage) {
    Write-Step "Baue Docker-Image neu (ohne Cache)..."
    docker-compose build --no-cache
} else {
    Write-Step "Baue Docker-Image..."
    docker-compose build
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Fehler beim Bauen des Docker-Images. Exit-Code: $LASTEXITCODE"
    exit 1
}

Write-Success "Docker-Image erfolgreich gebaut"

# Container starten
Write-Step "Starte Docker-Container..."
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Error "Fehler beim Starten des Docker-Containers. Exit-Code: $LASTEXITCODE"
    exit 1
}

Write-Success "Docker-Container erfolgreich gestartet"
Write-Host ""
Write-Host "AFM Dashboard ist verfügbar unter: http://localhost:$Port/" -ForegroundColor $colorSuccess

# Container-Logs anzeigen
Write-Host ""
Write-Host "Container-Logs werden angezeigt (Strg+C zum Beenden):" -ForegroundColor $colorInfo
Write-Host ""
docker-compose logs -f
