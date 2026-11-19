const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'job-orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial state
const freshState = () => ({
  jobs: [],
  lastUpdated: new Date().toISOString()
});

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      return {
        jobs: Array.isArray(parsed.jobs) ? parsed.jobs : (Array.isArray(parsed) ? parsed : []),
        lastUpdated: parsed.lastUpdated || new Date().toISOString()
      };
    }
  } catch (err) {
    console.error('[MHC Server] Error reading data file:', err.message);
  }
  const init = freshState();
  saveData(init);
  return init;
}

function saveData(data) {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('[MHC Server] Error writing data file:', err.message);
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('[MHC Server] Direct write fallback error:', e.message);
      return false;
    }
  }
}

// Intelligent two-way merge for job orders
function mergeJobs(serverJobs, incomingJobs) {
  if (!Array.isArray(incomingJobs)) return serverJobs;
  const jobMap = new Map();

  // Index server jobs by id and jobNo
  serverJobs.forEach(job => {
    if (job && (job.id || job.jobNo)) {
      jobMap.set(job.id || job.jobNo, { ...job });
    }
  });

  // Merge incoming
  incomingJobs.forEach(inc => {
    if (!inc || (!inc.id && !inc.jobNo)) return;
    const key = inc.id || inc.jobNo;
    const existing = jobMap.get(key);
    if (!existing) {
      jobMap.set(key, { ...inc });
    } else {
      // Merge updates: preserve whichever has more complete / recent data
      jobMap.set(key, {
        ...existing,
        ...inc,
        // Preserve receivedAt if inc doesn't have it or existing already had it
        receivedAt: inc.receivedAt || existing.receivedAt || '',
        receivedBy: inc.receivedBy || existing.receivedBy || '',
        status: inc.status || existing.status || 'Pending',
        priority: inc.priority || existing.priority || 'Normal',
        actionTaken: inc.actionTaken || existing.actionTaken || '',
        materialsUsed: inc.materialsUsed || existing.materialsUsed || '',
        remarks: inc.remarks || existing.remarks || ''
      });
    }
  });

  return Array.from(jobMap.values());
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // Global CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Health check endpoint
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      service: 'MHC Engineering Job Order Monitoring',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
  }

  // GET /api/data or /api/jobs -> Retrieve current jobs
  if ((pathname === '/api/data' || pathname === '/api/jobs') && req.method === 'GET') {
    const data = loadData();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    return res.end(JSON.stringify(data));
  }

  // POST or DELETE /api/reset -> Reset all data to empty state
  if ((pathname === '/api/reset' || pathname === '/api/jobs/reset') && (req.method === 'POST' || req.method === 'DELETE')) {
    const fresh = freshState();
    const success = saveData(fresh);
    if (success) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'All job order records have been reset successfully.',
        jobs: [],
        lastUpdated: fresh.lastUpdated
      }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Failed to reset data on server' }));
    }
  }

  // DELETE /api/jobs/:id -> Delete a specific job order
  if (pathname.startsWith('/api/jobs/') && req.method === 'DELETE') {
    const targetId = pathname.replace('/api/jobs/', '').trim();
    const currentState = loadData();
    const filteredJobs = currentState.jobs.filter(j => j.id !== targetId && j.jobNo !== targetId);
    const newState = {
      jobs: filteredJobs,
      lastUpdated: new Date().toISOString()
    };
    const success = saveData(newState);
    if (success) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        deletedId: targetId,
        count: filteredJobs.length,
        jobs: filteredJobs,
        lastUpdated: newState.lastUpdated
      }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Failed to delete record on server' }));
    }
  }

  // POST /api/sync -> Sync / save job orders
  if ((pathname === '/api/sync' || pathname === '/api/jobs') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Safeguard max payload 15MB
      if (body.length > 15 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const incomingJobs = Array.isArray(payload.jobs) ? payload.jobs : (Array.isArray(payload) ? payload : null);

        if (!incomingJobs) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid payload format. Expected { jobs: [...] }' }));
        }

        const currentState = loadData();
        const shouldReplace = payload.replace === true || payload.action === 'reset';
        const finalJobs = shouldReplace ? incomingJobs : mergeJobs(currentState.jobs, incomingJobs);
        const newState = {
          jobs: finalJobs,
          lastUpdated: new Date().toISOString()
        };

        const success = saveData(newState);
        if (success) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: true,
            count: finalJobs.length,
            jobs: finalJobs,
            lastUpdated: newState.lastUpdated
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Failed to write data on server' }));
        }
      } catch (err) {
        console.error('[MHC Server] JSON parse error on sync:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
      }
    });
    return;
  }

  // Static File Serving
  if (req.method === 'GET' || req.method === 'HEAD') {
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    const safePath = path.normalize(path.join(__dirname, pathname));

    // Security check: ensure path stays within repository
    if (!safePath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Forbidden');
    }

    fs.stat(safePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback: if user accesses /MHC_Engineering_Job_Order_System.html or index.html
        const indexPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
          const ext = path.extname(indexPath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': contentType });
          return fs.createReadStream(indexPath).pipe(res);
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('File Not Found');
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(safePath).pipe(res);
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log(`[MHC Server] May Harvest Corporation Job Order System live on http://localhost:${PORT}`);
  console.log(`[MHC Server] Storage: ${DATA_FILE}`);
});
