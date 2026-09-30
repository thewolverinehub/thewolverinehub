#Requires -Version 5.1
<#
.SYNOPSIS
  First-time local development setup for The Wolverine Hub.
.DESCRIPTION
  Checks prerequisites, starts Docker services, creates .env files,
  and installs Node dependencies for both web and cms.
  Run from the repo root: .\scripts\setup.ps1
#>

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

function Write-Step([string]$msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-OK([string]$msg)   { Write-Host "   OK  $msg" -ForegroundColor Green }
function Write-Warn([string]$msg) { Write-Host "   WARN $msg" -ForegroundColor Yellow }
function Write-Fail([string]$msg) { Write-Host "   FAIL $msg" -ForegroundColor Red; exit 1 }

# ── 1. Prerequisites ──────────────────────────────────────────────────────────
Write-Step "Checking prerequisites"

# Node.js
try {
  $nodeVersion = (node --version 2>&1).ToString().TrimStart('v')
  $nodeMajor   = [int]($nodeVersion -split '\.')[0]
  if ($nodeMajor -ge 22) { Write-OK "Node.js $nodeVersion" }
  else { Write-Warn "Node.js $nodeVersion found — v22+ required. Install from https://nodejs.org" }
} catch { Write-Warn "Node.js not found — install from https://nodejs.org" }

# npm
try {
  $npmVersion = (npm --version 2>&1).ToString()
  Write-OK "npm $npmVersion"
} catch { Write-Warn "npm not found — bundled with Node.js" }

# Docker
try {
  $dockerVersion = (docker --version 2>&1).ToString()
  Write-OK $dockerVersion
} catch { Write-Fail "Docker not found. Install Docker Desktop: https://www.docker.com/products/docker-desktop" }

# Docker Desktop running
try {
  docker info > $null 2>&1
  Write-OK "Docker daemon is running"
} catch { Write-Fail "Docker daemon is not running. Start Docker Desktop and retry." }

# Git
try {
  $gitVersion = (git --version 2>&1).ToString()
  Write-OK $gitVersion
} catch { Write-Warn "Git not found — install from https://git-scm.com" }

# Railway CLI (optional)
try {
  $railwayVersion = (railway --version 2>&1).ToString()
  Write-OK "Railway CLI $railwayVersion"
} catch { Write-Warn "Railway CLI not found (optional). Install: https://docs.railway.com/guides/cli" }

# ── 2. Docker services ────────────────────────────────────────────────────────
Write-Step "Starting Docker services (PostgreSQL, Redis, MinIO)"
Set-Location $RepoRoot
docker compose up -d --remove-orphans
Write-OK "Docker services started"

# ── 3. Environment files ──────────────────────────────────────────────────────
Write-Step "Creating .env files from examples (skips if .env already exists)"

$envFiles = @(
  @{ Example = "cms\.env.example"; Target = "cms\.env" },
  @{ Example = "web\.env.example"; Target = "web\.env" }
)

foreach ($ef in $envFiles) {
  $examplePath = Join-Path $RepoRoot $ef.Example
  $targetPath  = Join-Path $RepoRoot $ef.Target

  if (Test-Path $targetPath) {
    Write-Warn "$($ef.Target) already exists — skipping (delete it to regenerate)"
  } elseif (Test-Path $examplePath) {
    Copy-Item $examplePath $targetPath
    Write-OK "$($ef.Target) created from example"
  } else {
    Write-Warn "$($ef.Example) not found yet — will be available after Phase 4 (Strapi) and Phase 5 (Astro)"
  }
}

# ── 4. Install dependencies ───────────────────────────────────────────────────
Write-Step "Installing Node dependencies"

$packages = @(
  @{ Dir = "web"; Label = "web (Astro)" },
  @{ Dir = "cms"; Label = "cms (Strapi)" }
)

foreach ($pkg in $packages) {
  $pkgDir  = Join-Path $RepoRoot $pkg.Dir
  $pkgJson = Join-Path $pkgDir "package.json"

  if (Test-Path $pkgJson) {
    Write-Host "   Installing $($pkg.Label) dependencies..."
    Push-Location $pkgDir
    npm install
    Pop-Location
    Write-OK "$($pkg.Label) dependencies installed"
  } else {
    Write-Warn "$($pkg.Label) package.json not found — run setup again after Phase 4/5"
  }
}

# ── 5. Done ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Edit cms\.env and web\.env with any local overrides"
Write-Host "  2. Start the CMS:     cd cms && npm run develop"
Write-Host "  3. Start the website: cd web && npm run dev"
Write-Host "  4. CMS admin:         http://localhost:1337/admin"
Write-Host "  5. Website:           http://localhost:4321"
Write-Host "  6. MinIO console:     http://localhost:9001"
