param(
    [switch]$ExternalAccess,
    [int]$PortNumber = 7188
)

$host.UI.RawUI.WindowTitle = "AFM Dashboard Dev Server"


Write-Host "AFM Dashboard Dev Server wird gestartet..." -ForegroundColor Cyan
Write-Host "Port: $PortNumber" -ForegroundColor Cyan
Write-Host "Externer Zugriff: $(if ($ExternalAccess) { 'Ja' } else { 'Nein' })" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hinweis: Stellen Sie sicher, dass die symbolischen Links für die CSV-Dateien existieren:" -ForegroundColor Yellow
Write-Host "  C:\Projekte\afm-react\public\AFMlog -> C:\Transfer\LIS_Simulator\AFMlog\" -ForegroundColor Yellow
Write-Host ""
Write-Host "Drücken Sie Strg+C zum Beenden" -ForegroundColor Cyan
Write-Host ""

# Starte den Vite-Entwicklungsserver
try {
    if ($ExternalAccess) {
        npm run dev -- --host --port $PortNumber
    } else {
        npm run dev -- --port $PortNumber
    }
} catch {
    Write-Host "Fehler beim Starten des Vite-Servers: $_" -ForegroundColor Red
}
