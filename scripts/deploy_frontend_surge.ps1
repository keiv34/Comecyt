# Script PowerShell para construir y desplegar el frontend con Surge
# Uso: ./deploy_frontend_surge.ps1 -projectDir "RedesSociales" -domain "mi-front.surge.sh"
param(
  [string]$projectDir = "RedesSociales",
  [string]$domain = ""
)

Push-Location $projectDir
Write-Host "Installing dependencies..."
npm install

Write-Host "Building frontend..."
npm run build

Set-Location dist

if ($domain -ne "") {
  Write-Host "Deploying to Surge with domain: $domain"
  surge --domain $domain
} else {
  Write-Host "Deploying to Surge (se pedirá dominio en CLI)"
  surge
}
Pop-Location
Write-Host "Frontend deployment script finished."