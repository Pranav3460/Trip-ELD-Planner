# 🚚 Trip & ELD Planner

> A full-stack web application built with **Django** (backend) and **React + Vite + TailwindCSS** (frontend).  
> The app helps truck drivers plan trips, view route instructions on a map, and generate **FMCSA-style ELD (Electronic Logging Device)** daily log sheets.

---

## ✦ Features

- **Landing Page**
  - Cartoon-style truck illustration in a centered container box  
  - "Get Started" button with smooth animation leading to the planner  

- **Trip Planner Form**
  - Current Location (autocomplete)  
  - Pickup Location  
  - Dropoff Location  
  - Current Cycle Used (validated 0–70 hrs)  

- **Route Visualization**
  - Interactive map with **React-Leaflet**  
  - Route polyline with fit-to-bounds zoom  
  - Markers for current, pickup, dropoff, and fuel stops (every 1000 miles)  
  - Popup details for each marker  

- **Trip Summary**
  - Total distance (miles)  
  - Estimated driving time (hours)  
  - Required days  
  - Remaining cycle hours  

- **Daily ELD Log Viewer**
  - FMCSA-style log grid per day  
  - Color-coded segments (Driving, On-Duty, Off-Duty, Rest)  
  - Multi-day scrolling for long trips  
  - Pickup & dropoff marked with duty hours  

- **Exports**
  - PDF export of logs (`html2canvas + jsPDF` or backend PDF)  
  - GPX route file (optional)  

- **Animations & UI**
  - Smooth page transitions with **Framer Motion**  
  - Modern responsive layouts with TailwindCSS  
  - Royal theme: **blue, gold, white**  
  - Loading skeletons and hover effects  

---

## ✦ Tech Stack

- **Frontend**  
  - React + Vite  
  - TailwindCSS  
  - React-Leaflet  

- **Backend**  
  - Django  
  - Django REST Framework  

- **APIs**  
  - OpenRouteService / Mapbox / Geoapify (routing & geocoding)  

- **PDF Generation**  
  - WeasyPrint (backend)  
  - or html2canvas + jsPDF (frontend)  

- **Hosting**  
  - Frontend → Vercel  
  - Backend → Render / Railway  

---

## ✦ Setup Instructions

### Backend (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # (or venv\Scripts\activate on Windows)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
