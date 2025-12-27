// Dashboard HTML Template Generator

const topicColors = {
  'orders/create': '#00ff88',
  'orders/updated': '#00cc66',
  'orders/fulfilled': '#22aa55',
  'orders/cancelled': '#ff6b6b',
  'products/create': '#00aaff',
  'products/update': '#0088cc',
  'products/delete': '#ff4757',
  'inventory_levels/update': '#ffa502',
  'customers/create': '#a55eea',
  'customers/update': '#8854d0',
  'refunds/create': '#ff6348',
  'app/uninstalled': '#ff4757'
};

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getEventDetails(event) {
  const data = event.data;
  if (!data) return '-';
  
  switch(event.topic) {
    case 'orders/create':
    case 'orders/updated':
    case 'orders/fulfilled':
    case 'orders/cancelled':
      return `Order #${data.order_number || data.name || data.id} - ${data.total_price ? '$' + data.total_price : ''}`;
    case 'products/create':
    case 'products/update':
    case 'products/delete':
      return data.title || `Product #${data.id}`;
    case 'customers/create':
    case 'customers/update':
      return data.email || `Customer #${data.id}`;
    case 'inventory_levels/update':
      return `Qty: ${data.available} (Item: ${data.inventory_item_id})`;
    case 'refunds/create':
      return `Order #${data.order_id}`;
    default:
      return '-';
  }
}

function generateTopicsGrid(byTopic) {
  const entries = Object.entries(byTopic);
  if (entries.length === 0) {
    return '<p style="color: #666; grid-column: 1/-1; text-align: center;">No events yet</p>';
  }
  
  return entries.map(([topic, count]) => `
    <div class="topic-card">
      <span class="topic-name">${topic}</span>
      <span class="topic-count" style="color: ${topicColors[topic] || '#00ff88'}">${count}</span>
    </div>
  `).join('');
}

function generateServerStatus(serverInfo) {
  const uptimeHours = Math.floor(serverInfo.uptime / 3600);
  const uptimeMinutes = Math.floor((serverInfo.uptime % 3600) / 60);
  const uptimeSeconds = serverInfo.uptime % 60;
  
  return `
    <div class="server-status">
      <div class="status-item">
        <span class="status-label">Uptime:</span>
        <span class="status-value">${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s</span>
      </div>
      <div class="status-item">
        <span class="status-label">Memory (RSS):</span>
        <span class="status-value">${serverInfo.memoryUsage.rss} MB</span>
      </div>
      <div class="status-item">
        <span class="status-label">Heap Used:</span>
        <span class="status-value">${serverInfo.memoryUsage.heapUsed} MB</span>
      </div>
      <div class="status-item">
        <span class="status-label">Heap Total:</span>
        <span class="status-value">${serverInfo.memoryUsage.heapTotal} MB</span>
      </div>
    </div>
  `;
}

function generateIntegrationsSection(integrations) {
  const services = integrations.services || [];
  return `
    <div class="integrations-grid">
      ${services.map(service => `
        <div class="integration-card ${service.connected ? 'connected' : 'disconnected'}">
          <div class="integration-icon">${service.name === 'Slack' ? '💬' : service.name === 'Notion' ? '📝' : service.name === 'Ollama' ? '🤖' : '🔗'}</div>
          <div class="integration-name">${service.name}</div>
          <div class="integration-status">${service.connected ? '✅ Connected' : '❌ Disconnected'}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function generateEventsChart(recentEvents) {
  // Group events by hour for the last 24 hours
  const now = new Date();
  const hours = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    hours.push(hour.getHours());
  }
  
  const eventCounts = hours.map(hour => {
    return recentEvents.filter(event => {
      const eventHour = new Date(event.timestamp).getHours();
      return eventHour === hour;
    }).length;
  });
  
  return `
    <canvas id="eventsChart" width="400" height="200"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      const ctx = document.getElementById('eventsChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(hours.map(h => h + ':00'))},
          datasets: [{
            label: 'Events',
            data: ${JSON.stringify(eventCounts)},
            backgroundColor: '#00ff88',
            borderColor: '#00cc66',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { color: '#eee' }, grid: { color: '#333' } },
            x: { ticks: { color: '#eee' }, grid: { color: '#333' } }
          },
          plugins: { legend: { labels: { color: '#eee' } } }
        }
      });
    </script>
  `;
}

export function generateDashboard(data) {
  const { storeUrl, summary, stats, recentEvents, serverInfo, integrations } = data;
  return `
<!DOCTYPE html>
<html>
<head>
  <title>📊 Webhook Dashboard - KhakiSol.com</title>
  <meta http-equiv="refresh" content="30">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f1a; color: #eee; min-height: 100vh; }
    .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; text-align: center; border-bottom: 2px solid #00ff88; }
    .header h1 { color: #00ff88; font-size: 2.5em; margin-bottom: 10px; }
    .header p { color: #888; }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat-card { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 25px; border-radius: 15px; text-align: center; border: 1px solid #333; transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-5px); border-color: #00ff88; }
    .stat-number { font-size: 3em; font-weight: bold; color: #00ff88; }
    .stat-label { color: #888; margin-top: 10px; text-transform: uppercase; font-size: 0.85em; letter-spacing: 1px; }
    .section { background: #1a1a2e; border-radius: 15px; padding: 25px; margin: 20px 0; border: 1px solid #333; }
    .section h2 { color: #00ff88; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .topic-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }
    .topic-card { background: #0f0f1a; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
    .topic-name { font-size: 0.9em; color: #ccc; }
    .topic-count { font-size: 1.5em; font-weight: bold; }
    .events-table { width: 100%; border-collapse: collapse; }
    .events-table th, .events-table td { padding: 15px; text-align: left; border-bottom: 1px solid #333; }
    .events-table th { color: #00ff88; text-transform: uppercase; font-size: 0.85em; letter-spacing: 1px; }
    .events-table tr:hover { background: #16213e; }
    .badge { padding: 5px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
    .time-ago { color: #888; font-size: 0.85em; }
    .event-id { font-family: monospace; color: #666; font-size: 0.8em; }
    .empty-state { text-align: center; padding: 60px; color: #666; }
    .empty-state h3 { margin-bottom: 10px; }
    .refresh-note { text-align: center; color: #666; font-size: 0.85em; margin-top: 20px; }
    .links { margin-top: 20px; text-align: center; }
    .links a { color: #00aaff; margin: 0 15px; text-decoration: none; }
    .links a:hover { text-decoration: underline; }
    .server-status { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
    .status-item { background: #0f0f1a; padding: 15px; border-radius: 10px; text-align: center; }
    .status-label { color: #888; font-size: 0.85em; text-transform: uppercase; }
    .status-value { color: #00ff88; font-size: 1.2em; font-weight: bold; display: block; margin-top: 5px; }
    .integrations-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
    .integration-card { background: #0f0f1a; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #333; }
    .integration-card.connected { border-color: #00ff88; }
    .integration-card.disconnected { border-color: #ff4757; }
    .integration-icon { font-size: 2em; margin-bottom: 10px; }
    .integration-name { color: #ccc; font-weight: bold; margin-bottom: 5px; }
    .integration-status { font-size: 0.85em; }
    .chart-section { margin: 20px 0; }
    .actions { text-align: center; margin: 20px 0; }
    .action-btn { background: #00ff88; color: #1a1a2e; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 0 10px; }
    .action-btn:hover { background: #00cc66; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛍️ KhakiSol.com</h1>
    <p>Webhook Dashboard | ${storeUrl} | Last updated: ${new Date().toLocaleString()}</p>
    <p style="margin-top: 10px;"><a href="https://khakisol.com" style="color: #00ff88; text-decoration: none;">🌐 Visit Store</a></p>
  </div>
  
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${stats.total}</div>
        <div class="stat-label">Total Events</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.today}</div>
        <div class="stat-label">Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.thisHour}</div>
        <div class="stat-label">This Hour</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${Object.keys(summary.byTopic).length}</div>
        <div class="stat-label">Event Types</div>
      </div>
    </div>
    
    <div class="section">
      <h2>📊 Events Over Last 24 Hours</h2>
      <div class="chart-section">
        ${generateEventsChart(recentEvents)}
      </div>
    </div>
    
    <div class="section">
      <h2>🔗 Integrations Status</h2>
      ${generateIntegrationsSection(integrations)}
    </div>
    
    <div class="section">
      <h2>⚙️ Server Status</h2>
      ${generateServerStatus(serverInfo)}
    </div>
    
    <div class="actions">
      <button class="action-btn" onclick="location.reload()">🔄 Refresh</button>
      <button class="action-btn" onclick="window.open('/dashboard/json', '_blank')">📄 View JSON</button>
    </div>
    
    <div class="links">
      <a href="/">🏠 Home</a>
      <a href="/health">❤️ Health</a>
      <a href="/api/shop">🏪 Shop Info</a>
      <a href="/api/products">📦 Products</a>
      <a href="/dashboard/json">📄 Raw JSON</a>
    </div>
    
    <p class="refresh-note">🔄 Auto-refreshes every 30 seconds</p>
  </div>
</body>
</html>
  `;
}

export default { generateDashboard };
