# MHC Engineering Job Order Request & Monitoring System

> **May Harvest Corporation — Engineering & Maintenance Department**  
> Official Document Reference: **MHC-ENG-JO-01 (Rev. 02)**

A fullstack plant job order management and real-time monitoring web application featuring automatic tracking numbering, cross-department dashboards, cloud synchronization, and official PDF Job Order slip generation.

---

## 🔐 Access Control & Official Accounts

### 1. Department Request Form
- **Access Level:** Open to All (`Access to All`)
- **Login Required:** Wala (Kahit sinong personnel sa planta ay maaaring magsumite ng Job Order nang direkta).

### 2. Engineering Dashboard (2 Accounts)
| Username | Password | Role / Designation |
| :--- | :--- | :--- |
| `engr.admin` | `engr.admin2026!` | Engineering Head / Lead Supervisor |
| `engr.tech` | `engr.tech2026!` | Engineering Maintenance / Technician |

### 3. Department Dashboard (2 Accounts)
| Username | Password | Role / Designation |
| :--- | :--- | :--- |
| `dept.user1` | `dept.user2026!` | Department Coordinator (Monitor 1) |
| `dept.user2` | `dept.lead2026!` | Department Supervisor (Monitor 2) |

### 4. Department Security PINs (4-digit Unique PIN per Department)
Bago makita ang mga job order status at records ng bawat departamento, kailangan munang ilagay ang unique 4-digit security PIN:

| Department / Area | Unique Security PIN |
| :--- | :---: |
| **Admin** | `1001` |
| **Basic-RKD** | `2001` |
| **Basic-Clean** | `2002` |
| **Further** | `3001` |
| **Blast** | `4001` |
| **Warehouse** | `5001` |
| **Quality** | `6001` |
| **Utility** | `7001` |
| **Canteen** | `8001` |
| **SMFI** | `9001` |
| **Others** | `9999` |
| *Master Override PIN (Engr Head)* | `8888` |

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
5. I-click ang **Create Web Service**. Sa loob ng 1-2 minuto ay live na ang iyong URL (hal. `https://job-order-request-monitoring.onrender.com`)!

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
- **Department Dashboard:** Binibigyang-daan ang bawat departamento na ma-monitor ang status ng kanilang mga sariling request na may 4-digit PIN verification.
- **Official PDF Export (MHC-ENG-JO-01):** 1-click generation ng official printable job order slip na may 3-card authentication signature boxes.
- **Bi-Directional Cloud Sync:** Nagsi-sync sa pagitan ng browser `localStorage` at ng cloud backend `data/job-orders.json` bawat 15 segundo nang hindi nawawala ang data kahit offline.
