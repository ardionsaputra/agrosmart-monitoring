/* mqtt.js — AgroSmart Monitor
   Koneksi MQTT via WebSocket, Subscribe, & Handler Pesan */
'use strict';

(function connectMQTT() {

  setBadgeState('connecting');
  addLog('🔌', 'Menghubungkan ke broker.hivemq.com…', '#7A9875');

  const clientId = CONFIG.MQTT.CLIENT_ID_PREFIX + Math.random().toString(16).slice(2, 8);

  const client = mqtt.connect(CONFIG.MQTT.BROKER_URL, {
    clientId,
    clean:           true,
    reconnectPeriod: CONFIG.MQTT.RECONNECT_PERIOD,
    connectTimeout:  CONFIG.MQTT.CONNECT_TIMEOUT,
  });

  /* ── Connected ── */
  client.on('connect', () => {
    State.mqttConnected = true;
    setBadgeState('online');
    addLog('✅', 'MQTT terhubung ke broker.hivemq.com', '#3FA733');

    client.subscribe(CONFIG.TOPICS.MOISTURE,    { qos: CONFIG.MQTT.QOS });
    client.subscribe(CONFIG.TOPICS.TEMPERATURE, { qos: CONFIG.MQTT.QOS });
    addLog('📡', `Subscribe: ${CONFIG.TOPICS.MOISTURE} & ${CONFIG.TOPICS.TEMPERATURE}`, '#7A9875');
  });

  /* ── Incoming Message ── */
  client.on('message', (topic, payload) => {
    const raw = payload.toString().trim();

    if (topic === CONFIG.TOPICS.MOISTURE) {
      handleMoisture(raw);
    } else if (topic === CONFIG.TOPICS.TEMPERATURE) {
      handleTemperature(raw);
    }
  });

  /* ── Reconnect ── */
  client.on('reconnect', () => {
    setBadgeState('connecting');
    addLog('🔄', 'Mencoba reconnect ke broker…', '#E9A012');
  });

  /* ── Offline ── */
  client.on('offline', () => {
    State.mqttConnected = false;
    setBadgeState('offline');
    addLog('❌', 'Koneksi MQTT terputus', '#C0392B');
  });

  /* ── Error ── */
  client.on('error', (err) => {
    setBadgeState('offline');
    addLog('❌', 'Error MQTT: ' + err.message, '#C0392B');
  });

})();

/* HANDLERS*/

function handleMoisture(raw) {
  const val = parseInt(raw, 10);
  if (isNaN(val)) return;

  const t = nowLabel();
  State.lastMoisture = val;
  State.pushMoisture(t, val);

  // Update UI
  updateMoistureCard(val);
  updateGaugeMoisture(val);
  updateTicker(t);
  pushRealtimePoint('moisture', val, t);

  // Pompa logic
  const pumpOn = val < CONFIG.MOISTURE.DRY;
  updatePumpStatus(pumpOn, val);

  // Hitung event penyiraman (edge: OFF → ON)
  if (pumpOn && !State.prevPumpState) {
    State.addWatering(); // simpan ke localStorage
    const count = State.wateringCount;
    updateWateringCard(count, t);
    updatePumpCount(count, t);
    addLog('💧', `Penyiraman otomatis ke-${count} dimulai (kelembapan ${val}%)`, '#1A6FB5');
  }

  State.prevPumpState = pumpOn;
  addLog('💧', `moisture = ${val}%`, '#3FA733');
}

function handleTemperature(raw) {
  if (raw === 'ERROR') {
    addLog('⚠', 'DHT22 gagal dibaca (ERROR)', '#E9A012');
    return;
  }

  const val = parseFloat(raw);
  if (isNaN(val)) return;

  const t = nowLabel();
  State.lastTemp = val;
  State.pushTemp(t, val);

  // Update UI
  updateTempCard(val);
  updateGaugeTemp(val);
  pushRealtimePoint('temperature', val, t);

  addLog('🌡', `temperature = ${val.toFixed(1)}°C`, '#E9A012');
}

function nowLabel() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => n.toString().padStart(2, '0')).join(':');
}
