/* app.js — AgroSmart Monitor
   Entry Point: Inisialisasi, Tab Navigation & Page Router */
'use strict';

/* Inisialisasi saat halaman pertama kali dibuka. */
document.addEventListener('DOMContentLoaded', () => {
  // Tampilkan jumlah penyiraman hari ini dari localStorage
  // (otomatis 0 jika sudah ganti hari karena todayStr() pakai tanggal lokal)
  initWateringCard();
});

/**
 * Navigasi ke halaman tertentu
 * @param {'dashboard'|'riwayat'|'tanaman'|'tentang'} page
 * @param {HTMLElement} btn
 */
function goTo(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  btn.classList.add('active');

  if (page === 'riwayat') renderHistCharts();
}

/*Reset semua data riwayat mingguan dari localStorage*/
function clearWeeklyData() {
  if (!confirm('Hapus semua data riwayat 7 hari? Tindakan ini tidak bisa dibatalkan.')) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.MOISTURE_WEEK);
    localStorage.removeItem(STORAGE_KEYS.TEMP_WEEK);
    localStorage.removeItem(STORAGE_KEYS.WATERING_WEEK);
  } catch (e) { }

  // Destroy & re-render history charts
  histInited = false;
  [hChart1, hChart2, hChart3].forEach(c => { if (c) c.destroy(); });
  hChart1 = hChart2 = hChart3 = null;
  renderHistCharts();

  // Reset tampilan dashboard
  initWateringCard();
  addLog('🗑', 'Data riwayat mingguan dihapus', '#C0392B');
}