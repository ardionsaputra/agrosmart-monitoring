/* state.js — AgroSmart Monitor
   Shared Application State, Data History & localStorage */
'use strict';

const STORAGE_KEYS = {
  MOISTURE_WEEK: 'agrosmart_moisture_week',
  TEMP_WEEK:     'agrosmart_temp_week',
  WATERING_WEEK: 'agrosmart_watering_week',
};

const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
};

/* ── Date helpers — LOKAL ── */
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const y   = d.getFullYear();
    const m   = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
}

function formatDate(isoDate) {
  const [, m, d] = isoDate.split('-');
  return `${d}/${m}`;
}

/* ── Weekly History ── */
const WeeklyHistory = {

  load(key) {
    const data  = Storage.get(key) || [];
    const valid = new Set(last7Days());
    return data.filter(d => valid.has(d.date));
  },

  save(key, data) {
    Storage.set(key, data);
  },

  push(key, value) {
    const data   = this.load(key);
    const today  = todayStr();
    let entry    = data.find(d => d.date === today);
    if (!entry) {
      entry = { date: today, readings: [] };
      data.push(entry);
    }
  
    entry.readings.push(Number(value));
    if (entry.readings.length > 2000) entry.readings.shift();
    this.save(key, data);
  },


  _nums(readings) {
    return (readings || [])
      .map(r => (r !== null && typeof r === 'object') ? Number(r.v) : Number(r))
      .filter(n => Number.isFinite(n));
  },

  buildChartData(key) {
    const data   = this.load(key);
    const days   = last7Days();
    const labels = days.map(formatDate);
    const values = days.map(date => {
      const entry = data.find(d => d.date === date);
      if (!entry) return null;
      const nums = this._nums(entry.readings);
      if (nums.length === 0) return null;
      const avg = nums.reduce((s, v) => s + v, 0) / nums.length;
      return Math.round(avg * 10) / 10;
    });
    return { labels, values };
  },

  weekAvg(key) {
    const data = this.load(key);
    const all  = data.flatMap(d => this._nums(d.readings));
    if (all.length === 0) return null;
    const avg = all.reduce((s, v) => s + v, 0) / all.length;
    return Number.isFinite(avg) ? avg : null;
  },
};

/* ── Watering Weekly ── */
const WateringWeekly = {
  load() {
    const data  = Storage.get(STORAGE_KEYS.WATERING_WEEK) || [];
    const valid = new Set(last7Days());
    return data.filter(d => valid.has(d.date));
  },
  addOne() {
    const data  = this.load();
    const today = todayStr();
    let entry   = data.find(d => d.date === today);
    if (!entry) { entry = { date: today, count: 0 }; data.push(entry); }
    entry.count++;
    Storage.set(STORAGE_KEYS.WATERING_WEEK, data);
  },
  buildChartData() {
    const data = this.load();
    return last7Days().map(date => ({
      label: formatDate(date),
      count: (data.find(d => d.date === date) || { count: 0 }).count,
    }));
  },
  todayCount() {
    return (this.load().find(d => d.date === todayStr()) || { count: 0 }).count;
  },
};

/* ── Runtime State ── */
const State = {
  mqttConnected:   false,
  lastMoisture:    null,
  lastTemp:        null,
  prevPumpState:   false,

  get wateringCount() { return WateringWeekly.todayCount(); },

  moistureHistory: [],
  tempHistory:     [],

  pushMoisture(t, v) {
    this.moistureHistory.push({ t, v });
    WeeklyHistory.push(STORAGE_KEYS.MOISTURE_WEEK, v);
  },

  pushTemp(t, v) {
    this.tempHistory.push({ t, v });
    WeeklyHistory.push(STORAGE_KEYS.TEMP_WEEK, v);
  },

  addWatering() { WateringWeekly.addOne(); },
};