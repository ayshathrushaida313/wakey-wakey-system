# Wakey Wakey – Driver Drowsiness Detection System

A real-time AI-based system that detects driver drowsiness and sends instant alerts to prevent accidents.

## 🚗 Overview
Wakey Wakey monitors a driver's eyes in real time using computer vision. If drowsiness is detected (eyes closing for too long), it triggers an alert — helping prevent accidents caused by fatigue.

## 🌐 Live Demo
Try the live dashboard here: [Wakey Wakey Live Demo](https://wakey-wakey-system.lovable.app/)

The dashboard includes:
- Real-time fatigue score and blink rate tracking
- Live camera-based drowsiness monitoring
- Driver alerts and history
- Eye calibration settings

## 🛠️ Tech Stack
- **Python**
- **OpenCV** – real-time video processing
- **dlib** – facial landmark detection
- **EAR (Eye Aspect Ratio) Algorithm** – drowsiness detection logic
- **Telegram Bot API** – instant alert notifications

## ⚙️ How It Works
1. Captures live video feed from a camera
2. Detects facial landmarks using dlib
3. Calculates Eye Aspect Ratio (EAR) to track eye closure
4. If EAR falls below a threshold for a set duration, the system flags drowsiness
5. Sends a real-time alert via Telegram Bot API

## 📌 Use Case
Designed for driver safety systems — can be integrated into vehicles or used as a standalone monitoring tool.

## 🔧 Setup
```bash
git clone https://github.com/ayshathrushaida313/wakey-wakey-system.git
cd wakey-wakey-system
pip install -r requirements.txt
python main.py
```

## 📈 Future Improvements
- Mobile app integration
- Multi-driver dataset testing
- Cloud-based alert logging
