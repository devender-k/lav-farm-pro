@echo off
set GIT="%LOCALAPPDATA%\MinGit\cmd\git.exe"
set GH="C:\Program Files\GitHub CLI\gh.exe"

%GIT% config --global user.name "Lavkush"
%GIT% config --global user.email "lavkush@farmpro.local"
%GIT% config --global init.defaultBranch main

if not exist .git (
    echo Initializing Git repository...
    %GIT% init
)

echo Staging files...
%GIT% add .

echo Committing files...
%GIT% commit -m "Deploy Farm Pro with Render configuration"

echo Creating GitHub repository devender-k/lav-farm-pro...
%GH% repo create devender-k/lav-farm-pro --public --source=. --remote=origin --push

echo.
echo ==============================================================
echo [SUCCESS] Repository is live on GitHub!
echo Repository URL: https://github.com/devender-k/lav-farm-pro
echo ==============================================================
