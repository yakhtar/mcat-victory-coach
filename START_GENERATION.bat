@echo off
echo ==========================================
echo    MCAT 700-Question Generation
echo ==========================================
echo.
echo This script will continue generating questions
echo toward the 700-question target.
echo.
echo It can be stopped with Ctrl+C and restarted
echo at any time - it resumes where it left off.
echo.
echo Current directory: %cd%
echo.
pause

cd /d "C:\Users\akhta\my_projects\Sub-Agents\projects\mcat-platform-clean"
node scripts/persistent-generation.js

pause