import cv2  # type: ignore
import dlib
import imutils  # type: ignore
from scipy.spatial import distance as dist
import serial
import time
from collections import deque

# --- CONFIGURATION ---
SERIAL_PORT = 'COM6'  # Change to your ESP32's port (e.g., /dev/ttyUSB0 on Linux)
BAUD_RATE = 115200
EYE_AR_CONSEC_FRAMES = 25  # More frames to avoid false positives
CALIBRATION_TIME = 5       # Seconds to calibrate baseline EAR/MAR

# Initialize Serial Communication
try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Connected to ESP32 on {SERIAL_PORT}")
except Exception as e:
    print(f"Serial Error: {e}. Running in simulation mode (no ESP32).")
    ser = None

def get_aspect_ratios(shape):
    # Eye indices: Left(42-48), Right(36-42) | Mouth indices: (48-68)
    def ear(eye):
        A = dist.euclidean(eye[1], eye[5])
        B = dist.euclidean(eye[2], eye[4])
        C = dist.euclidean(eye[0], eye[3])
        return (A + B) / (2.0 * C)
    
    leftEAR = ear(shape[42:48])
    rightEAR = ear(shape[36:42])
    
    # Mouth Ratio
    m_vertical = dist.euclidean(shape[62], shape[66])
    m_horizontal = dist.euclidean(shape[60], shape[64])
    mar = m_vertical / m_horizontal
    
    return (leftEAR + rightEAR) / 2.0, mar

# Setup detector and predictor
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks (2).dat")
cap = cv2.VideoCapture(0)

# --- Calibration Phase ---
print("Calibrating... Please keep eyes open and mouth closed.")
start_time = time.time()
ear_values, mar_values = [], []

while time.time() - start_time < CALIBRATION_TIME:
    ret, frame = cap.read()
    if not ret: break
    frame = imutils.resize(frame, width=450)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rects = detector(gray, 0)
    
    for rect in rects:
        shape = predictor(gray, rect)
        shape = [(shape.part(i).x, shape.part(i).y) for i in range(68)]
        ear, mar = get_aspect_ratios(shape)
        ear_values.append(ear)
        mar_values.append(mar)

baseline_EAR = sum(ear_values) / len(ear_values) if ear_values else 0.3
baseline_MAR = sum(mar_values) / len(mar_values) if mar_values else 0.5

EYE_AR_THRESH = baseline_EAR * 0.75   # 25% lower than baseline
MOUTH_AR_THRESH = baseline_MAR * 1.3  # 30% higher than baseline

print(f"Calibration complete. EAR_thresh={EYE_AR_THRESH:.2f}, MAR_thresh={MOUTH_AR_THRESH:.2f}")

# --- Monitoring Phase ---
counter = 0
ear_history = deque(maxlen=10)
mar_history = deque(maxlen=10)

while True:
    ret, frame = cap.read()
    if not ret: break
    frame = imutils.resize(frame, width=450)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rects = detector(gray, 0)
    
    status = "NORMAL"

    for rect in rects:
        shape = predictor(gray, rect)
        shape = [(shape.part(i).x, shape.part(i).y) for i in range(68)]
        ear, mar = get_aspect_ratios(shape)

        # Add to history for smoothing
        ear_history.append(ear)
        mar_history.append(mar)
        avg_ear = sum(ear_history) / len(ear_history)
        avg_mar = sum(mar_history) / len(mar_history)

        # Drowsiness logic
        if avg_ear < EYE_AR_THRESH:
            counter += 1
        else:
            counter = 0

        if counter >= EYE_AR_CONSEC_FRAMES or avg_mar > MOUTH_AR_THRESH:
            status = "DROWSY"

    # Send command to ESP32
    if ser:
        ser.write(f"{status}\n".encode())

    # Visual UI
    color = (0, 255, 0) if status == "NORMAL" else (0, 0, 255)
    cv2.putText(frame, f"STATE: {status}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    cv2.imshow("AI Driver Monitor", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
