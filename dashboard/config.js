/* config.js — AgroSmart Monitor
   Konfigurasi MQTT, Topic, dan Threshold Sensor */
   
'use strict';

const CONFIG = Object.freeze({
  MQTT: {
    BROKER_URL:       'wss://broker.hivemq.com:8884/mqtt',
    CLIENT_ID_PREFIX: 'agrosmart-web-',
    RECONNECT_PERIOD: 5000,
    CONNECT_TIMEOUT:  10000,
    QOS:              0,
  },
  TOPICS: {
    MOISTURE:    'agrosmart/moisture',
    TEMPERATURE: 'agrosmart/temperature',
  },
  MOISTURE: {
    DRY: 30,
    WET: 80,
  },
  TEMPERATURE: {
    COLD:        22,
    HOT:         32,
    MIN_DISPLAY: 15,
    MAX_DISPLAY: 45,
  },
  CHART: {
    MAX_REALTIME_POINTS: 60,
    MAX_HISTORY_POINTS:  30,
  },
  LOG: {
    MAX_ENTRIES: 15,
  },
});
