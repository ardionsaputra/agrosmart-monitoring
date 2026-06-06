# Smart Irrigation IoT Dashboard

Realtime IoT monitoring dashboard for an automatic plant watering system using ESP32 and MQTT.

## Live Demo
Dashboard : https://agrosmart-lembab-akl.netlify.app/

## Overview

Smart Irrigation IoT Dashboard is a web-based monitoring system designed to monitor soil moisture and environmental conditions in real time. The system uses an ESP32 microcontroller to collect sensor data and transmit it through MQTT, allowing users to monitor plant conditions directly from a web dashboard.

This project demonstrates the integration of embedded systems, IoT communication protocols, and web technologies in a single application.

---

## Features

* Real-time soil moisture monitoring
* Real-time temperature monitoring
* MQTT-based communication
* Interactive data visualization using charts
* Responsive web dashboard
* Automatic irrigation system integration
* Modular and maintainable code structure

---

## System Architecture

```text
Soil Moisture Sensor
Temperature Sensor
          │
          ▼
        ESP32
          │
          │ MQTT
          ▼
     MQTT Broker
          │
          ▼
  Web Dashboard
          │
          ▼
 Real-time Monitoring
```

---

## Technologies Used

### Embedded System

* ESP32
* Arduino IDE
* C++

### Communication Protocol

* MQTT

### Frontend

* HTML5
* CSS3
* JavaScript

### Visualization

* Chart.js

---

## Project Structure

```text
smart-irrigation-iot/
│
├── dashboard/
│   ├── app.js
│   ├── charts.js
│   ├── config.js
│   ├── mqtt.js
│   ├── state.js
│   ├── ui.js
│   ├── index.html
│   ├── base.css
│   ├── layout.css
│   └── components.css
│
├── docs/
│   ├── dashboard.jpeg
│   ├── riwayat.jpeg
│   ├── tanaman.jpeg
│   └── tentang.jpeg
│
└── firmware/
    └── esp32/
        └── alat_penyiram_tanaman_otomatis.ino
```

---

## Dashboard Preview

### Main Dashboard

![Dashboard](../docs/dashboard.jpeg)

### History Page

![History](../docs/riwayat.jpeg)

### Plant Monitoring

![Plant Monitoring](../docs/tanaman.jpeg)

### About Page

![About](../docs/tentang.jpeg)

---

## How It Works

1. Sensors collect environmental data such as soil moisture and temperature.
2. ESP32 processes the sensor readings.
3. Data is published to an MQTT broker.
4. The dashboard subscribes to MQTT topics and receives updates in real time.
5. Sensor data is displayed through gauges, indicators, and charts for monitoring purposes.

---

## Learning Outcomes

Through this project, I gained experience in:

* IoT system development
* MQTT publish-subscribe communication
* ESP32 programming
* Real-time web application development
* Data visualization
* Modular JavaScript architecture
* Frontend integration with IoT devices

---

## Future Improvements

* User authentication and authorization
* Historical data storage with database integration
* Pump control from the dashboard
* Mobile application integration
* Cloud deployment for remote access

---

## Author

Ardion Rizqi Chandra Saputra

Informatics Engineering Student
UPN Veteran Jawa Timur
