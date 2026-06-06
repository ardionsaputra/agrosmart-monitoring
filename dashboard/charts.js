/* charts.js — AgroSmart Monitor
   Real-time chart (dashboard) & History charts (riwayat 7 hari) */
'use strict';

/*  REAL-TIME CHART — Dashboard */
const mainChart = new Chart(
  document.getElementById('mainChart').getContext('2d'),
  {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Kelembapan (%)',
          data: [],
          borderColor: '#3FA733',
          backgroundColor: 'rgba(63,167,51,0.08)',
          fill: true, tension: 0.4, pointRadius: 2,
          pointBackgroundColor: '#3FA733', borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: 'Suhu (°C)',
          data: [],
          borderColor: '#E9A012',
          backgroundColor: 'rgba(233,160,18,0.06)',
          fill: true, tension: 0.4, pointRadius: 2,
          pointBackgroundColor: '#E9A012', borderWidth: 2,
          borderDash: [5, 3],
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend:  { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          grid:  { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 10 }, color: '#7A9875', maxTicksLimit: 10, maxRotation: 0 },
        },
        y: {
          min: 0, max: 100,
          grid:  { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 }, color: '#3FA733', callback: v => v + '%' },
        },
        y1: {
          min: 15, max: 45,
          position: 'right',
          grid:  { display: false },
          ticks: { font: { size: 11 }, color: '#E9A012', callback: v => v + '°' },
        },
      },
    },
  }
);

function pushRealtimePoint(type, val, timeLabel) {
  const MAX = CONFIG.CHART.MAX_REALTIME_POINTS;
  if (type === 'moisture') {
    if (mainChart.data.labels.length >= MAX) {
      mainChart.data.labels.shift();
      mainChart.data.datasets[0].data.shift();
    }
    mainChart.data.labels.push(timeLabel);
    mainChart.data.datasets[0].data.push(val);
  } else {
    if (mainChart.data.datasets[1].data.length >= MAX) mainChart.data.datasets[1].data.shift();
    while (mainChart.data.datasets[1].data.length < mainChart.data.labels.length - 1)
      mainChart.data.datasets[1].data.push(null);
    mainChart.data.datasets[1].data.push(val);
  }
  mainChart.update('none');
}

/* HISTORY CHARTS — Riwayat 7 Hari
   Setiap grafik hanya 7 titik: satu titik = rata-rata satu hari */
let histInited = false;
let hChart1, hChart2, hChart3;

function renderHistCharts() {
  // Bangun data 7 titik (rata-rata per hari)
  const mData = WeeklyHistory.buildChartData(STORAGE_KEYS.MOISTURE_WEEK);
  const tData = WeeklyHistory.buildChartData(STORAGE_KEYS.TEMP_WEEK);
  const wData = WateringWeekly.buildChartData();

  // Update stat cards rata-rata
  const avgM = WeeklyHistory.weekAvg(STORAGE_KEYS.MOISTURE_WEEK);
  const avgT = WeeklyHistory.weekAvg(STORAGE_KEYS.TEMP_WEEK);
  updateHistStats(avgM, avgT);

  const wLabels = wData.map(d => d.label);
  const wCounts = wData.map(d => d.count);

  // Highlight hari ini (index terakhir = hari ini)
  const todayLabel = formatDate(todayStr());
  const barColors  = wLabels.map(l =>
    l === todayLabel ? 'rgba(26,111,181,0.85)' : 'rgba(26,111,181,0.4)'
  );

  if (!histInited) {
    histInited = true;

    /* ── Chart 1: Kelembapan rata-rata per hari ── */
    hChart1 = new Chart(
      document.getElementById('histChart1').getContext('2d'),
      {
        type: 'line',
        data: {
          labels: mData.labels,
          datasets: [{
            label: 'Rata-rata Kelembapan (%)',
            data: mData.values,
            borderColor: '#3FA733',
            backgroundColor: 'rgba(63,167,51,0.12)',
            fill: true, tension: 0.35, borderWidth: 2.5,
            pointRadius: 5, pointHoverRadius: 7,
            pointBackgroundColor: '#3FA733',
            pointBorderColor: '#fff', pointBorderWidth: 2,
            spanGaps: true,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: ctx => 'Tanggal: ' + ctx[0].label,
                label: ctx => ctx.parsed.y !== null
                  ? ' Rata-rata: ' + ctx.parsed.y + '%'
                  : ' Tidak ada data',
              },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { font: { size: 11 }, color: '#7A9875' },
            },
            y: {
              min: 0, max: 100,
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { font: { size: 11 }, color: '#7A9875', callback: v => v + '%' },
            },
          },
        },
      }
    );

    /* ── Chart 2: Suhu rata-rata per hari ── */
    hChart2 = new Chart(
      document.getElementById('histChart2').getContext('2d'),
      {
        type: 'line',
        data: {
          labels: tData.labels,
          datasets: [{
            label: 'Rata-rata Suhu (°C)',
            data: tData.values,
            borderColor: '#E9A012',
            backgroundColor: 'rgba(233,160,18,0.10)',
            fill: true, tension: 0.35, borderWidth: 2.5,
            pointRadius: 5, pointHoverRadius: 7,
            pointBackgroundColor: '#E9A012',
            pointBorderColor: '#fff', pointBorderWidth: 2,
            spanGaps: true,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: ctx => 'Tanggal: ' + ctx[0].label,
                label: ctx => ctx.parsed.y !== null
                  ? ' Rata-rata: ' + ctx.parsed.y + '°C'
                  : ' Tidak ada data',
              },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { font: { size: 11 }, color: '#7A9875' },
            },
            y: {
              min: 15, max: 45,
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { font: { size: 11 }, color: '#7A9875', callback: v => v + '°C' },
            },
          },
        },
      }
    );

    /* ── Chart 3: Penyiraman per hari ── */
    hChart3 = new Chart(
      document.getElementById('histChart3').getContext('2d'),
      {
        type: 'bar',
        data: {
          labels: wLabels,
          datasets: [{
            label: 'Penyiraman',
            data: wCounts,
            backgroundColor: barColors,
            borderColor: '#1A6FB5',
            borderWidth: 1, borderRadius: 6, borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: ctx => 'Tanggal: ' + ctx[0].label,
                label: ctx => ' ' + ctx.parsed.y + '× penyiraman',
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: '#7A9875' },
            },
            y: {
              min: 0,
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { font: { size: 11 }, color: '#7A9875', callback: v => v + '×', stepSize: 1 },
            },
          },
        },
      }
    );

  } else {
    /* Update chart yang sudah ada */
    hChart1.data.labels           = mData.labels;
    hChart1.data.datasets[0].data = mData.values;
    hChart1.update();

    hChart2.data.labels           = tData.labels;
    hChart2.data.datasets[0].data = tData.values;
    hChart2.update();

    hChart3.data.labels                        = wLabels;
    hChart3.data.datasets[0].data             = wCounts;
    hChart3.data.datasets[0].backgroundColor  = barColors;
    hChart3.update();
  }
}