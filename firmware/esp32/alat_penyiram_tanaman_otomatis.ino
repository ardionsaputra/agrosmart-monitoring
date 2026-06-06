#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// WIFI

const char* ssid = "REVINDA";
const char* password = "semogaberkah";

// MQTT

const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

// DHT22

#define DHTPIN 18
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

// PIN

int soilPin = 34;
int relayPin = 27;
int buzzerPin = 25;

// KALIBRASI SOIL

int dryValue = 2800;
int wetValue = 1400;

// WIFI CONNECT

void setup_wifi() {

  Serial.println();
  Serial.print("Connecting WiFi ");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi Connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// MQTT CONNECT

void reconnect() {

  while (!client.connected()) {

    Serial.print("Connecting MQTT...");

    String clientId = "ESP32-";
    clientId += String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {

      Serial.println("Connected MQTT");
    }
    else {

      Serial.print("Failed MQTT rc=");
      Serial.println(client.state());

      delay(2000);
    }
  }
}

// SETUP

void setup() {

  Serial.begin(115200);

  dht.begin();

  pinMode(relayPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  // relay OFF
  digitalWrite(relayPin, HIGH);

  setup_wifi();

  client.setServer(mqtt_server, 1883);

  delay(2000);

  Serial.println("SMART IRRIGATION SYSTEM");
}
// LOOP

void loop() {

  // reconnect MQTT
  if (!client.connected()) {
    reconnect();
  }

  client.loop();

  // BACA SOIL MOISTURE

  int sensorValue = analogRead(soilPin);

  int moisture =
    map(sensorValue, dryValue, wetValue, 0, 100);

  moisture =
    constrain(moisture, 0, 100);

  // BACA DHT22

  float suhu = dht.readTemperature();

  // SERIAL MONITOR

  Serial.print("Moisture: ");
  Serial.print(moisture);
  Serial.println("%");

  // KONDISI TANAH

  if (moisture < 30) {

    Serial.println("Status: KERING");

    // relay ON
    digitalWrite(relayPin, LOW);

    // buzzer bunyi
    digitalWrite(buzzerPin, HIGH);
    delay(200);

    digitalWrite(buzzerPin, LOW);
  }
  else if (moisture <= 80) {

    Serial.println("Status: LEMBAB");

    // relay OFF
    digitalWrite(relayPin, HIGH);

    digitalWrite(buzzerPin, LOW);
  }
  else {

    Serial.println("Status: BASAH");

    // relay OFF
    digitalWrite(relayPin, HIGH);

    digitalWrite(buzzerPin, LOW);
  }

  // MQTT MOISTURE

  String moistureStr = String(moisture);

  client.publish(
    "agrosmart/moisture",
    moistureStr.c_str()
  );

  // MQTT TEMPERATURE

  if (!isnan(suhu)) {

    Serial.print("Temperature: ");
    Serial.print(suhu);
    Serial.println(" C");

    String suhuStr = String(suhu);

    client.publish(
      "agrosmart/temperature",
      suhuStr.c_str()
    );

    Serial.println("Temperature MQTT Sent");
  }
  else {

    Serial.println("DHT22 TIDAK TERBACA");

    client.publish(
      "agrosmart/temperature",
      "ERROR"
    );
  }

  // STATUS MQTT

  Serial.println("MQTT Publish Success");

  Serial.println("====================");

  delay(5000);
}