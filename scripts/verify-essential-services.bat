@echo off
title LLZ Tweaks - Essential Services
echo Configuring and starting essential Windows services...
echo.
sc config dps start=auto
sc config diagtrack start=auto
sc config pcasvc start=auto
sc config sysmain start=auto
sc start dps
sc start diagtrack
sc start pcasvc
sc start sysmain
echo.
echo Done. You can close this window.
pause >nul
