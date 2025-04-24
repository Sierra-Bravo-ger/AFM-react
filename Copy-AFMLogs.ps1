# Quellverzeichnis
$sourcePath = "C:\Transfer\LIS_Simulator\AFMlog"

# Zielverzeichnisse
$targetPaths = @(
    "P:\afm-react\AFMlog",
    "C:\Projekte\afm-react\public\AFMlog"
)

# Liste der zu kopierenden Dateien
$filesToCopy = @(
    "AFM_input_details.csv",
    "AFM_status_log.csv",
    "AFM_pattern_matches.csv",
    "AFM_error_log.csv"
)

# Schleife über alle Dateien und alle Ziele
foreach ($file in $filesToCopy) {
    $sourceFile = Join-Path $sourcePath $file

    if (Test-Path $sourceFile) {
        foreach ($targetPath in $targetPaths) {
            $targetFile = Join-Path $targetPath $file
            Copy-Item -Path $sourceFile -Destination $targetFile -Force
            Write-Host "$file kopiert nach $targetPath" -ForegroundColor Green
        }
    } else {
        Write-Host "$file nicht gefunden in $sourcePath" -ForegroundColor Yellow
    }
}