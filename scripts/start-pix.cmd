@echo off
setlocal
cd /d "D:\Git Project\pix"

if not exist "apps\desktop\node_modules\electron\dist\electron.exe" (
  echo Installing Electron runtime...
  call corepack pnpm electron:install
  if errorlevel 1 (
    echo Electron installation failed.
    pause
    exit /b 1
  )
)

call corepack pnpm dev
if errorlevel 1 pause
