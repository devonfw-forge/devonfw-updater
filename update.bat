@echo off
IF NOT EXIST .\updater\node_modules (
call npm --prefix .\updater\ install .\updater\
)
call node .\updater\src\update.js
PAUSE 