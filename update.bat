@echo off
call npm --prefix .\updater\ install .\updater\
call node .\updater\src\update.js
echo Press any key to finish...
PAUSE >nul