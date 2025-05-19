@echo off

REM バッチファイルがあるディレクトリ (%~dp0 はこのバッチファイルの親ディレクトリのパス)
set BASE_PATH=%~dp0

REM --- 設定 ---
REM Djangoプロジェクトのルート (manage.py がある場所) はバッチファイルと同じ場所
set DJANGO_PROJECT_PATH=%BASE_PATH%

REM Electronアプリのディレクトリ (バッチファイルのある場所からの相対パス)
set ELECTRON_APP_SUBDIR=electron-app
set ELECTRON_APP_PATH=%BASE_PATH%%ELECTRON_APP_SUBDIR%

REM 仮想環境はバッチファイルの親ディレクトリにある 'env' フォルダ
set DJANGO_VENV_PATH=%BASE_PATH%..\env
set DJANGO_VENV_ACTIVATE=%DJANGO_VENV_PATH%\Scripts\activate.bat
REM --- 設定ここまで ---

echo Current Directory: %CD%
echo Base Path (Script Directory): %BASE_PATH%
echo Django Project Path: %DJANGO_PROJECT_PATH%
echo Electron App Path: %ELECTRON_APP_PATH%
echo Django Venv Path: %DJANGO_VENV_PATH%
echo Django Venv Activate: %DJANGO_VENV_ACTIVATE%

:START_DJANGO
echo.
echo Starting Django development server...
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
    echo               Will try to run 'python' from system PATH or already active venv.
)
echo Running command: python manage.py runserver
REM Djangoサーバーをバックグラウンドで起動 (ウィンドウは表示しない)
start "" /b python manage.py runserver

REM Djangoサーバーが起動するまで少し待つ (秒数は調整してください)
echo.
echo Waiting for Django server to initialize (e.g., 10 seconds)...
timeout /t 10 /nobreak > nul

:START_ELECTRON
echo.
echo Starting Electron application...
cd /d "%ELECTRON_APP_PATH%"
IF NOT EXIST "%ELECTRON_APP_PATH%\package.json" (
    echo ERROR: package.json not found in %ELECTRON_APP_PATH%.
    echo               Please check the ELECTRON_APP_SUBDIR setting or your project structure.
    pause
    goto :END
)
echo Running command: npm start
REM Electronアプリをバックグラウンドで起動 (ウィンドウは表示しない)
start "" /b npm start

echo.
echo Both processes have been initiated in the background.
echo To stop them, you will need to find their processes (e.g., using Task Manager) and terminate them.

:END
echo.
pause