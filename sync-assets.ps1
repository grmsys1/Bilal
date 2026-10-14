$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$AssetsRoot = Join-Path $PSScriptRoot 'app\src\main\assets'

New-Item -ItemType Directory -Force -Path $AssetsRoot | Out-Null
Copy-Item -Path (Join-Path $ProjectRoot 'game.html') -Destination $AssetsRoot -Force
Copy-Item -Path (Join-Path $ProjectRoot 'css') -Destination $AssetsRoot -Recurse -Force
Copy-Item -Path (Join-Path $ProjectRoot 'js') -Destination $AssetsRoot -Recurse -Force

Write-Host "Игра скопирована в $AssetsRoot"
