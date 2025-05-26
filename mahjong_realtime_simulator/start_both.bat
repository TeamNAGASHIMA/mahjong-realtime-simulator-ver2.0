@echo off

REM --- 設定 (既存の設定を維持) ---
set BASE_PATH=%~dp0
set DJANGO_PROJECT_PATH=%BASE_PATH%
set ELECTRON_APP_SUBDIR=electron-app
set ELECTRON_APP_PATH=%BASE_PATH%%ELECTRON_APP_SUBDIR%
set DJANGO_VENV_PATH=%BASE_PATH%..\env
set DJANGO_VENV_ACTIVATE=%DJANGO_VENV_PATH%\Scripts\activate.bat
REM --- 設定ここまで ---

echo Current Directory: %CD%
echo Base Path (Script Directory): %BASE_PATH%
echo Django Project Path: %DJANGO_PROJECT_PATH%
echo Electron App Path: %ELECTRON_APP_PATH%
echo Django Venv Path: %DJANGO_Venv_PATH%
echo Django Venv Activate: %DJANGO_Venv_Activate%

:START_DJANGO
echo.
echo Starting Django development server on port 8002...
cd /d "%DJANGO_PROJECT_PATH%"
IF EXIST "%DJANGO_VENV_ACTIVATE%" (
    echo Activating Django virtual environment from: %DJANGO_VENV_ACTIVATE%
    call "%DJANGO_VENV_ACTIVATE%"
    IF "%ERRORLEVEL%" NEQ "0" (
        echo Error activating virtual environment. Please check the path.
        pause
        goto :END
    )
) ELSE (
    echo Warning: Django venv activate script not found at %DJANGO_VENV_ACTIVATE%.
    echo Will try to run 'python' from system PATH or already active venv.
)
echo Running command: python manage.py runserver 8010
start "" /b python manage.py runserver 8010

REM Djangoサーバーが起動するまで少し待つ
echo.
echo Waiting for Django server to initialize...
timeout /t 15 /nobreak > nul

:START_ELECTRON
echo.
echo Starting Electron application...
cd /d "%ELECTRON_APP_PATH%"
IF NOT EXIST "%ELECTRON_APP_PATH%\package.json" (
    echo ERROR: package.json not found in %ELECTRON_APP_PATH%.
    echo             Please check the ELECTRON_APP_SUBDIR setting or your project structure.
    pause
    goto :END
)
echo Running command: npm start
start "" /b npm start

echo.
echo Waiting for Electron app to start...
REM Electron プロセスが存在するまで数回確認
FOR /L %%i IN (1,1,5) DO (
    timeout /t 2 /nobreak > nul
    tasklist /fi "imagename eq electron.exe" | find /i "electron.exe" > nul
    IF ERRORLEVEL 0 (
        echo Electron app found. Proceeding to wait for close.
        goto :WAIT_ELECTRON
    )
    echo Electron app not yet found (attempt %%i/5)
)
echo Electron app did not start in the expected time. Proceeding to wait for close (may cause issues).

echo.
echo Both processes have been initiated in the background.
echo Waiting for Electron app to close before stopping Django server...

:WAIT_ELECTRON
tasklist /fi "imagename eq electron.exe" | find /i "electron.exe" > nul
IF ERRORLEVEL 1 (
    echo Electron app has closed. Stopping Django server...
    goto :STOP_DJANGO
)
timeout /t 1 /nobreak > nul
netstat -ano | findstr "8010"
goto :WAIT_ELECTRON

:STOP_DJANGO
echo.
echo Stopping Django development server on port 8002...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":8010" ^| findstr "LISTENING"') DO (
    ECHO Found Django process on port 8010 with PID: %%P
    taskkill /PID %%P /F
    IF "%ERRORLEVEL%" NEQ "0" (
        echo Failed to terminate Django process with PID: %%P
    ) ELSE (
        echo Successfully terminated Django process.
    )
)
echo Django server on port 8010 not found.

:END
echo.
pause