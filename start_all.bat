@echo off
echo Starting AI Research Paper Analysis System...

echo Starting Backend (FastAPI on port 8000)...
start "Backend Server" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

echo Starting Frontend (Next.js on port 3000)...
start "Frontend Dev" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Services are starting:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - Swagger Docs: http://localhost:8000/docs
echo ========================================================
pause
