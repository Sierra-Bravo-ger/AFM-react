#!/usr/bin/env pwsh
<#
#.SYNOPSIS
    Build und Push eines Docker-Images für AFM Dashboard
#.DESCRIPTION
    Dieses Skript baut ein Docker-Image für das AFM Dashboard und pusht es zu Docker Hub
#.PARAMETER DockerHubUsername
    Der Docker Hub Benutzername
#.PARAMETER ImageName
    Der Name des Images (Standard: 'afm-react')
#.PARAMETER Tag
    Der Tag für das Docker-Image (Standard: 'latest')
#.PARAMETER RebuildImage
    Wenn gesetzt, wird das Image ohne Cache neu gebaut
#.PARAMETER SkipPush
    Wenn gesetzt, wird das Image nicht zu Docker Hub gepusht
#.EXAMPLE
    ./docker-build-and-push.ps1 -DockerHubUsername "deinbenutzername"
    ./docker-build-and-push.ps1 -DockerHubUsername "deinbenutzername" -ImageName "afm-dashboard" -Tag "v1.0"
    ./docker-build-and-push.ps1 -DockerHubUsername "deinbenutzername" -RebuildImage
    ./docker-build-and-push.ps1 -DockerHubUsername "deinbenutzername" -SkipPush
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$ImageName = "afm-react",
    
    [Parameter(Mandatory=$false)]
    [string]$Tag = "latest",
    
    [Parameter(Mandatory=$false)]
    [switch]$RebuildImage = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPush = $false
)

# Vollständiger Image-Name mit Tag
$fullImageName = "${DockerHubUsername}/${ImageName}:${Tag}"
$localImageName = "${ImageName}:${Tag}"

# Prüfen, ob Docker installiert ist
try {
    $dockerVersion = docker --version
    Write-Host "Docker gefunden: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker ist nicht installiert oder nicht im PATH. Bitte installieren Sie Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "AFM Dashboard Docker Build und Push" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Docker Hub Username: $DockerHubUsername" -ForegroundColor Cyan
Write-Host "Image Name: $ImageName" -ForegroundColor Cyan
Write-Host "Tag: $Tag" -ForegroundColor Cyan
Write-Host "Vollständiger Image-Name: $fullImageName" -ForegroundColor Cyan
Write-Host ""

# Docker-Image bauen
if ($RebuildImage) {
    Write-Host "Baue Docker-Image neu (ohne Cache)..." -ForegroundColor Cyan
    docker build --no-cache -t $localImageName .
} else {
    Write-Host "Baue Docker-Image..." -ForegroundColor Cyan
    docker build -t $localImageName .
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Bauen des Docker-Images. Exit-Code: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Write-Host "Docker-Image erfolgreich gebaut: $localImageName" -ForegroundColor Green

# Image taggen
Write-Host "Tagge Image als $fullImageName..." -ForegroundColor Cyan
docker tag $localImageName $fullImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Taggen des Images. Exit-Code: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

# Image zu Docker Hub pushen
if (-not $SkipPush) {
    Write-Host "Pushe Image zu Docker Hub..." -ForegroundColor Cyan
    docker push $fullImageName
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Fehler beim Pushen des Images zu Docker Hub. Exit-Code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Sind Sie bei Docker Hub angemeldet? Versuchen Sie 'docker login'." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Image erfolgreich zu Docker Hub gepusht: $fullImageName" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Das Image kann nun auf anderen Systemen mit folgendem Befehl gepullt werden:" -ForegroundColor Cyan
    Write-Host "  docker pull $fullImageName" -ForegroundColor Cyan
    
    # Deployment-Hinweise
    Write-Host ""
    Write-Host "Deployment-Hinweise:" -ForegroundColor Cyan
    Write-Host "1. Erstellen Sie auf dem Zielsystem eine docker-compose.yml" -ForegroundColor Cyan
    Write-Host "2. Starten Sie den Container mit: docker-compose up -d" -ForegroundColor Cyan
    Write-Host "3. Zugriff auf das Dashboard: http://[server-ip]:7188/" -ForegroundColor Cyan
    Write-Host "Optional: Update via Watchtower API:" -ForegroundColor Cyan
    Write-Host "curl -H "Authorization: Bearer mein_api_token" http://192.168.178.43:6060/v1/update" -ForegroundColor Cyan
} else {
    Write-Host "Das Pushen zu Docker Hub wurde übersprungen." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Um das Image manuell zu pushen, führen Sie aus:" -ForegroundColor Cyan
    Write-Host "  docker push $fullImageName" -ForegroundColor Cyan
}
