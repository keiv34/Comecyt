param(
  [Parameter(Mandatory=$true)]
  [string]$remoteUrl
)

Write-Host "Setting remote origin to: $remoteUrl"
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin $remoteUrl
Write-Host "Pushing current branch to origin/main..."
git push -u origin main
Write-Host "Done. If push failed, check your GitHub credentials or permissions."