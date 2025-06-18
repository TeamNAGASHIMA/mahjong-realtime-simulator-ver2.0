@echo off

REM --- 設定 (既存の設定を維持) ---
set BASE_PATH=%~dp0
set DJANGO_PROJECT_PATH=%BASE_PATH%
set ELECTRON_APP_SUBDIR=electron-app
set ELECTRON_APP_PATH=%BASE_PATH%%ELECTRON_APP_SUBDIR%
set DJANGO_VENV_PATH=%BASE_PATH%..\env
set DJANGO_VENV_ACTIVATE=%DJANGO_VENV_PATH%\Scripts\activate.bat
set SERVER_EXE_PATH=%BASE_PATH%\mahjong_cpp\server.exe
REM --- 設定ここまで ---

echo Current Directory: %CD%
echo Base Path (Script Directory): %BASE_PATH%
echo Django Project Path: %DJANGO_PROJECT_PATH%
echo Electron App Path: %ELECTRON_APP_PATH%
echo Django Venv Path: %DJANGO_Venv_PATH%
echo Django Venv Activate: %DJANGO_Venv_Activate%
echo Server Executable Path: %SERVER_EXE_PATH%

:START_SERVER
echo.
echo Starting server.exe...
IF NOT EXIST "%SERVER_EXE_PATH%" (
    echo ERROR: server.exe not found at %SERVER_EXE_PATH%.
    echo Please ensure server.exe is in the script's directory or update SERVER_EXE_PATH.
    pause
    goto :END
)
REM server.exe をバックグラウンドで起動
start "" /b "%SERVER_EXE_PATH%"

echo.
echo Waiting for server.exe to start...
:WAIT_FOR_SERVER_EXE
    tasklist /fi "imagename eq server.exe" | find /i "server.exe" > nul
    IF %ERRORLEVEL% NEQ 0 (
        echo server.exe not yet running...
        timeout /t 2 /nobreak > nul
        goto :WAIT_FOR_SERVER_EXE
    )
echo server.exe is now running.


:START_DJANGO
echo.
echo Starting Django development server on port 8010...
cd /d "%DJANGO_PROJECT_PATH%"
IF EXIST "%DJANGO_VENV_ACTIVATE%" (
    echo Activating Django virtual environment from: %DJANGO_VENV_ACTIVATE%
    call "%DJANGO_VENV_ACTIVATE%"
    IF "%ERRORLEVEL%" NEQ "0" (
        echo Error activating virtual environment. Please check the path.
        pause
        goto :STOP_SERVER_AND_END
    )
) ELSE (
    echo Warning: Django venv activate script not found at %DJANGO_VENV_ACTIVATE%.
    echo Will try to run 'python' from system PATH or already active venv.
)
echo Running command: python manage.py runserver 8010
start "" /b python manage.py runserver 8010

REM Djangoサーバーが起動するまでポートを監視
echo.
echo Waiting for Django server to initialize and listen on port 8010...
:WAIT_FOR_DJANGO_PORT
    netstat -ano | findstr ":8010" | findstr "LISTENING" > nul
    IF %ERRORLEVEL% NEQ 0 (
        echo Django server not yet listening on port 8010...
        timeout /t 2 /nobreak > nul
        goto :WAIT_FOR_DJANGO_PORT
    )
echo Django server is now listening on port 8010.

:START_ELECTRON
echo.
echo Starting Electron application...
cd /d "%ELECTRON_APP_PATH%"
IF NOT EXIST "%ELECTRON_APP_PATH%\package.json" (
    echo ERROR: package.json not found in %ELECTRON_APP_PATH%.
    echo           Please check the ELECTRON_APP_SUBDIR setting or your project structure.
    pause
    goto :STOP_ALL_PROCESSES
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
echo Waiting for Electron app to close before stopping Django server and server.exe...

:WAIT_ELECTRON
timeout /t 10 /nobreak > nul
tasklist /fi "imagename eq electron.exe" | find /i "electron.exe" > nul
IF ERRORLEVEL 1 (
    echo Electron app has closed. Stopping Django server and server.exe...
    goto :STOP_ALL_PROCESSES
)
timeout /t 1 /nobreak > nul
netstat -ano | findstr "8010"
goto :WAIT_ELECTRON

:STOP_ALL_PROCESSES
REM --- セクション追加: server.exe の終了 ---
echo.
echo Stopping server.exe...
tasklist /fi "imagename eq server.exe" | find /i "server.exe" > nul
IF %ERRORLEVEL% EQU 0 (
    FOR /F "tokens=2" %%P IN ('tasklist /fi "imagename eq server.exe" /nh') DO (
        ECHO Found server.exe with PID: %%P
        taskkill /PID %%P /F
        IF "%ERRORLEVEL%" NEQ "0" (
            echo Failed to terminate server.exe with PID: %%P
        ) ELSE (
            echo Successfully terminated server.exe.
        )
    )
) ELSE (
    echo server.exe not found or already stopped.
)
REM --- セクション追加ここまで ---

:STOP_DJANGO
echo.
echo Stopping Django development server on port 8010...
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

:STOP_SERVER_AND_END
echo.
echo All processes stopped.

:END
echo.
pause