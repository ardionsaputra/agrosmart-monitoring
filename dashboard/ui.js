/* ui.js — AgroSmart Monitor
   Semua fungsi update DOM: badge, card, gauge, pompa, log*/

'use strict';

/* ── Helpers ── */
function nowLabel() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => n.toString().padStart(2, '0')).join(':');
}

function flashEl(el) {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

function setText(id, text) { document.getElementById(id).textContent = text; }
function setHTML(id, html) { document.getElementById(id).innerHTML = html; }
function setStyleProp(id, p, v) { document.getElementById(id).style[p] = v; }

/* ── Badge Status ── */
function setBadgeState(state) {
  const labels = {
    online: { nav: 'MQTT Terhubung', mq: 'LIVE' },
    offline: { nav: 'Koneksi Terputus', mq: 'OFFLINE' },
    connecting: { nav: 'Menghubungkan…', mq: 'MQTT…' },
  };
  document.getElementById('navBadge').className = 'status-badge ' + state;
  document.getElementById('mqttBadge').className = 'mqtt-badge ' + state;
  setText('navBadgeText', labels[state].nav);
  setText('mqttBadgeText', labels[state].mq);
}

/* ── Moisture Card ── */
function updateMoistureCard(val) {
  const pct = Math.min(100, Math.max(0, val));
  const el = document.getElementById('valMoisture');
  el.innerHTML = val + '<span class="mc-unit">%</span>';
  flashEl(el);
  setStyleProp('barMoisture', 'width', pct + '%');

  let text, color;
  if (val < CONFIG.MOISTURE.DRY) { text = '⚠ Kering — Pompa Aktif!'; color = 'var(--red)'; }
  else if (val <= CONFIG.MOISTURE.WET) { text = '✓ Kondisi Ideal (30–80%)'; color = 'var(--green-700)'; }
  else { text = '💧 Terlalu Basah'; color = 'var(--blue)'; }

  const sm = document.getElementById('statusMoisture');
  sm.textContent = text;
  sm.style.color = color;
}

/* ── Temp Card ── */
function updateTempCard(val) {
  const range = CONFIG.TEMPERATURE.MAX_DISPLAY - CONFIG.TEMPERATURE.MIN_DISPLAY;
  const pct = Math.min(100, Math.max(0, ((val - CONFIG.TEMPERATURE.MIN_DISPLAY) / range) * 100));
  const el = document.getElementById('valTemp');
  el.innerHTML = val.toFixed(1) + '<span class="mc-unit">°C</span>';
  flashEl(el);
  setStyleProp('barTemp', 'width', pct + '%');

  let text, color;
  if (val < CONFIG.TEMPERATURE.COLD) { text = '❄ Suhu Dingin'; color = 'var(--blue)'; }
  else if (val <= CONFIG.TEMPERATURE.HOT) { text = '✓ Suhu Ideal (22–32°C)'; color = 'var(--green-700)'; }
  else { text = '🌡 Suhu Panas'; color = 'var(--red)'; }

  const st = document.getElementById('statusTemp');
  st.textContent = text;
  st.style.color = color;
}

/* ── Watering Card ── */
function updateWateringCard(count, time) {
  setHTML('valWatering', count + '<span class="mc-unit">×</span>');
  setStyleProp('barWatering', 'width', Math.min(100, count * 10) + '%');
  const sm = document.getElementById('statusWatering');
  sm.textContent = count === 0 ? 'Belum ada penyiraman' : 'Terakhir: ' + time;
  sm.style.color = count === 0 ? 'var(--text-muted)' : 'var(--blue)';
}

/* ── Gauge Bars (sidebar) ── */
function updateGaugeMoisture(val) {
  setStyleProp('gaugeMoisture', 'width', Math.min(100, Math.max(0, val)) + '%');
  setText('gaugeValMoisture', val + '%');
}

function updateGaugeTemp(val) {
  const range = CONFIG.TEMPERATURE.MAX_DISPLAY - CONFIG.TEMPERATURE.MIN_DISPLAY;
  const pct = Math.min(100, Math.max(0, ((val - CONFIG.TEMPERATURE.MIN_DISPLAY) / range) * 100));
  setStyleProp('gaugeTemp', 'width', pct + '%');
  setText('gaugeValTemp', val.toFixed(1) + '°C');
}

/* ── Pump Status ── */
function updatePumpStatus(pumpOn, moisture) {
  const ring = document.getElementById('pumpRing');
  const label = document.getElementById('pumpLabel');
  const alert = document.getElementById('pumpAlert');
  const alertT = document.getElementById('pumpAlertText');

  if (pumpOn) {
    ring.className = 'pump-ring pump-on';
    label.textContent = 'AKTIF';
    alert.className = 'alert alert-dry';
    alertT.textContent = '💧 Kelembapan rendah! Pompa sedang menyiram…';
  } else if (moisture !== null && moisture > CONFIG.MOISTURE.WET) {
    ring.className = 'pump-ring pump-off';
    label.textContent = 'STANDBY';
    alert.className = 'alert alert-warn';
    alertT.textContent = '⚠ Tanah terlalu basah. Pompa standby.';
  } else {
    ring.className = 'pump-ring pump-off';
    label.textContent = 'STANDBY';
    alert.className = 'alert alert-ok';
    alertT.textContent = 'Tanah dalam kondisi ideal. Pompa standby otomatis.';
  }
}

function updatePumpCount(count, time) {
  setText('pumpCount', count);
  setText('lastWaterTime', count > 0 ? 'Terakhir ' + time : 'Belum ada');
}

/* ── Live Ticker ── */
function updateTicker(time) { setText('lastUpdateTime', time); }

/* ── Activity Log ── */
function addLog(icon, text, dotColor) {
  const list = document.getElementById('logList');
  const time = nowLabel();

  // Hapus placeholder awal
  const first = list.children[0];
  if (first) {
    const dot = first.querySelector('.log-dot');
    if (dot && dot.style.background === 'var(--text-muted)') list.innerHTML = '';
  }

  const item = document.createElement('div');
  item.className = 'log-item';
  item.innerHTML =
    `<div class="log-time">${time}</div>` +
    `<div class="log-dot" style="background:${dotColor}"></div>` +
    `<div class="log-text">${icon} ${text}</div>`;
  list.prepend(item);

  while (list.children.length > CONFIG.LOG.MAX_ENTRIES) list.removeChild(list.lastChild);
}

/* ── Riwayat Stats ── */
function updateHistStats(avgMoisture, avgTemp) {
  // Guard: null atau NaN ditampilkan sebagai "—"
  if (avgMoisture !== null && Number.isFinite(avgMoisture)) setText('avgMoistureStat', avgMoisture.toFixed(1) + '%');
  if (avgTemp !== null && Number.isFinite(avgTemp)) setText('avgTempStat', avgTemp.toFixed(1) + '°C');
}

/* ── Init watering card dari localStorage saat halaman pertama dibuka ── */
function initWateringCard() {
  const count = WateringWeekly.todayCount();
  setHTML('valWatering', count + '<span class="mc-unit">×</span>');
  setStyleProp('barWatering', 'width', Math.min(100, count * 10) + '%');
  setText('pumpCount', count);
  const sm = document.getElementById('statusWatering');
  if (count > 0) {
    sm.textContent = 'Data dari sesi sebelumnya';
    sm.style.color = 'var(--blue)';
    setText('lastWaterTime', count + '× hari ini');
  }
}