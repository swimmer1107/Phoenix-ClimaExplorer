# 🌍 PyClimaExplorer: Planetary Intelligence Hub
### **Team Phoenix · Technex'26 · IIT BHU**

PyClimaExplorer is a state-of-the-art climate intelligence platform designed to visualize, analyze, and predict planetary shifts using high-dimensional satellite and sensor data. It features a high-performance engine capable of processing massive **NetCDF (.nc)** planetary archives and transforming them into interactive 3D visualizations.

---

## 🚀 Key Features

### 1. **Planetary Observation Grid (3D Globe)**
Visualize climate vectors (Temperature, Rainfall, CO2, Humidity) on a high-fidelity interactive 3D globe. Powered by **Three.js**, it provides a multidimensional diagnostic lattice of the Earth's health.

### 2. **Temporal Intelligence Hub**
Analyze climate trends over decades. The platform automatically aggregates temporal data to show long-term shifts in planetary metrics with precision charting.

### 3. **NetCDF Protocol (Advanced Ingestion)**
A high-speed processing pipeline that handles heavy `.nc` files. Features include:
- **Intelligent Downsampling**: Reduces millions of spatial points to interactive web-ready grids.
- **Smart Resampling**: Automatically compresses daily/monthly data into yearly snapshots.
- **Variable Mapping**: Recognizes over 20+ scientific naming conventions for climate variables.

### 4. **Regional Correlation Matrix**
Compute statistical shifts across different geographic zones (Africa, Asia, Europe, etc.) using vectorized regional tagging logic.

### 5. **Autonomous Insights**
AI-driven diagnostic engine that generates statistical summaries, identifying anomalies and trend directions (In-bounds vs. Extreme deviation).

---

## 🛠️ Technology Stack

| Layer | Tooling |
| :--- | :--- |
| **Frontend** | React 19, Vite, Three.js (React Three Fiber), Framer Motion, Tailwind CSS |
| **Backend** | FastAPI (Python), Uvicorn |
| **Data Engine** | Pandas, NumPy, Xarray, Dask, Scipy, NetCDF4 |
| **Visualization** | Recharts, Lucide Icons |

---

## 🔄 Workflow Logic

1. **Ingress**: Users upload a `CSV` or `NetCDF (.nc)` file via the **Temporal Ingress** portal.
2. **Standardization**: The backend engine scans the file for coordinates (Lat/Lon) and time dimensions. It maps scientific variables (like `tas` or `pr`) to human-readable climate vectors.
3. **Thinning**: Aggressive spatial and temporal downsampling is applied to ensure "Judge-Ready" performance (instant rendering on any device).
4. **Synchronization**: The **Bulk API** serves trends, specific globe points, and heatmaps in a single unified request to minimize network latency.
5. **Visualization**: The frontend renders a liquid thermal ribbon, trend charts, and a volumetric globe point-cloud.

---

## ⚡ Performance Optimizations

- **Bulk API Endpoint**: Reduces 7+ parallel requests to 1 single unified sync, preventing server timeouts.
- **Dask Lazy Loading**: Processes large datasets without overloading the server RAM.
- **Global Signature Sync**: Implements cross-device cache invalidation to ensure all users see the same real-time planetary data snapshots.
- **Engine-Level Overhaul**: Use of the `h5netcdf` and `scipy` engines for maximum file compatibility.

---

## 📦 Installation & Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

**Developed with ❤️ by Team Phoenix for Technex'26.**  
*Exploring the frontiers of planetary resilience.*
