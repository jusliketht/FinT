@echo off
REM Client directory structure
mkdir client\public
mkdir client\src\assets
mkdir client\src\components
mkdir client\src\pages\Dashboard
mkdir client\src\pages\Reports
mkdir client\src\pages\Settings
mkdir client\src\pages\Auth
mkdir client\src\redux\slices
mkdir client\src\services
mkdir client\src\styles

REM Server directory structure
mkdir server\config
mkdir server\controllers
mkdir server\models
mkdir server\routes
mkdir server\services
mkdir server\utils
mkdir server\middleware
mkdir server\uploads

echo Directory structure created successfully! 