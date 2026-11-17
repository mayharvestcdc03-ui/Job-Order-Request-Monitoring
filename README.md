# MHC Engineering Job Order Request & Monitoring System

> **May Harvest Corporation — Engineering & Maintenance Department**  
> Official Document Reference: **MHC-ENG-JO-01 (Rev. 02)**

A fullstack plant job order management and real-time monitoring web application featuring automatic tracking numbering, cross-department dashboards, cloud synchronization, and official PDF Job Order slip generation.

---

## 🚀 100% Ready for Online Deployment

This repository is pre-configured for instant zero-configuration deployment on:

### Option A: Render.com (Recommended & Free)
1. Mag-login sa [render.com](https://render.com).
2. I-click ang **New +** > **Web Service**.
3. Piliin ang repository: `mayharvestcdc03-ui/Job-Order-Request-Monitoring`.
4. Awtomatikong babasahin ng Render ang `render.yaml` o i-set ang:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. I-click ang **Create Web Service**. Sa loob ng 1-2 minuto ay live na ang iyong URL (hal. `https://mhc-job-order-system.onrender.com`)!

### Option B: Railway.app (Free / Instant)
1. Mag-login sa [railway.app](https://railway.app).
2. I-click ang **New Project** > **Deploy from GitHub repo**.
3. Piliin ang `Job-Order-Request-Monitoring`.
4. Awtomatikong idedeploy dahil may `Procfile` at `package.json`.

---

## 🛠️ Local Development & Testing

Para patakbuhin sa iyong computer:
```bash
# Clone the repository
git clone https://github.com/mayharvestcdc03-ui/Job-Order-Request-Monitoring.git

# Navigate to the folder
cd Job-Order-Request-Monitoring

# Start the Node.js server
npm start
```
Buksan ang browser sa: `http://localhost:3000`

---

## ✨ Features
- **Department Request Form:** May auto-generated JO tracking numbers (hal. `MHC-JO-ADMIN-001`, `MHC-JO-BLAST-002`).
- **Engineering Dashboard:** Real-time KPI counters (Pending, Ongoing, Done), SVG department charts, multi-parameter filtering, and quick updates.
- **Department Dashboard:** Binibigyang-daan ang bawat departamento na ma-monitor ang status ng kanilang mga sariling request.
- **Official PDF Export (MHC-ENG-JO-01):** 1-click generation ng official printable job order slip na may 3-card authentication signature boxes.
- **Bi-Directional Cloud Sync:** Nagsi-sync sa pagitan ng browser `localStorage` at ng cloud backend `data/job-orders.json` bawat 15 segundo nang hindi nawawala ang data kahit offline.
