/*
 AI-Powered Road Accident Prevention & Emergency Response System
 Embedded Module (Arduino UNO R3)

 ------------------------------------------------------------
 ⚠ NOTE:
 For prototype and testing purposes, potentiometers are used
 to simulate sensor inputs instead of actual hardware sensors.

 Sensor Simulation Mapping:
 - MPU6050 (Acceleration) → 3 Potentiometers (A0, A1, A2)
 - MAX30102 (Heart Rate) → Potentiometer (A3)
 - MQ-3 (Alcohol Sensor) → Potentiometer (A4)

 This allows controlled testing of:
 - Accident detection thresholds
 - Health abnormality detection
 - Alcohol detection
 - Smart emergency delay logic

 Actual sensors will replace potentiometers in final hardware version.
 ------------------------------------------------------------

 Features:
 - Accident Detection (Acceleration Magnitude)
 - Heart Rate Monitoring
 - Alcohol Detection
 - Smart 20-Second Emergency Delay
 - Emergency Cancel Button
 - LED & Buzzer Alert System

 Author: Krishna Chadda
 Date: March 2026
*/

// ================= PIN CONFIG =================
const int axPin = A0;
const int ayPin = A1;
const int azPin = A2;
const int hrPin = A3;
const int alcPin = A4;

const int buttonPin = 2;
const int buzzerPin = 8;
const int ledPin = 9;

// ================= STATE VARIABLES =================
bool emergencyActive = false;
unsigned long emergencyStartTime = 0;
bool previousDanger = false;

unsigned long lastBlinkTime = 0;
bool ledState = false;

unsigned long lastBeepTime = 0;
bool buzzerState = false;

void setup() {
  Serial.begin(9600);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
}

// ================= MAIN LOOP =================
void loop() {

  // ---- Read Sensors ----
  float ax = map(analogRead(axPin), 0, 1023, -16, 16);
  float ay = map(analogRead(ayPin), 0, 1023, -16, 16);
  float az = map(analogRead(azPin), 0, 1023, -16, 16);

  int heartRate = map(analogRead(hrPin), 0, 1023, 40, 160);
  int alcohol = map(analogRead(alcPin), 0, 1023, 0, 400);

  bool buttonPressed = digitalRead(buttonPin) == LOW;

  float accelerationMagnitude = sqrt(ax*ax + ay*ay + az*az);

  // ---- Threshold Logic ----
  // Accident if magnitude > 12g
  // Heart abnormal if <40 BPM or >150 BPM
  // Alcohol detected if level > 250
  
  bool accident = accelerationMagnitude > 12;
  bool heartAbnormal = (heartRate < 40 || heartRate > 150);
  bool drunk = alcohol > 250;

  bool dangerDetected = accident || heartAbnormal || drunk;


  // ---- Edge Trigger Detection ----
  if (dangerDetected && !previousDanger && !emergencyActive) {
    emergencyActive = true;
    emergencyStartTime = millis();
    Serial.println("⚠ Emergency Detected! Countdown Started...");
  }

  previousDanger = dangerDetected;

  // ---- Emergency State ----
  if (emergencyActive) {

    unsigned long elapsed = millis() - emergencyStartTime;

    // ---- Blink LED (non-blocking) ----
    if (millis() - lastBlinkTime >= 500) {
      ledState = !ledState;
      digitalWrite(ledPin, ledState);
      lastBlinkTime = millis();
    }

    // ---- Beep Buzzer (non-blocking) ----
    if (millis() - lastBeepTime >= 300) {
      buzzerState = !buzzerState;
      digitalWrite(buzzerPin, buzzerState);
      lastBeepTime = millis();
    }

    // ---- Cancel Emergency ----
    if (buttonPressed) {
      Serial.println("✅ Emergency Cancelled.");
      emergencyActive = false;
      digitalWrite(ledPin, LOW);
      digitalWrite(buzzerPin, LOW);
    }

    // ---- Confirm Emergency After 20s ----
    else if (elapsed >= 20000) {
      Serial.println("🚨 Emergency Confirmed! Sending Alert...");
      digitalWrite(ledPin, HIGH);
      digitalWrite(buzzerPin, HIGH);
      delay(3000);  // Simulated alert duration (blocking)
      emergencyActive = false;
      digitalWrite(ledPin, LOW);
      digitalWrite(buzzerPin, LOW);
    }
  }

  // ---- Debug Output ----
Serial.print("ACC:");
Serial.print(accelerationMagnitude);
Serial.print(";HR:");
Serial.print(heartRate);
Serial.print(";ALC:");
Serial.print(alcohol);
Serial.print(";EMG:");
Serial.println(emergencyActive);

  delay(200);
}