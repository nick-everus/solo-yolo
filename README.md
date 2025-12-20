# 🎯 Open Detection

**Open Detection** is a simple, fully local computer-vision project that uses your Mac’s webcam and performs **real-time object detection** with highlighted bounding boxes and labels — all running on your machine.

No cloud services. No API keys. No data leaves your computer.

---

## ✨ Features

- 📷 Live webcam capture in the browser
- 🧠 Real-time object detection using **YOLOv8**
- 🟩 Bounding boxes drawn over the video
- 🏷️ Object labels + confidence scores
- 📝 Live text list of detected objects
- 🖥️ Runs entirely **locally on macOS**
- 🌐 Simple web UI + local Python backend

---

## 🧱 Architecture

Browser (HTML + JS)
├─ Webcam capture
├─ Canvas overlay (boxes + labels)
└─ Sends frames via HTTP
↓
FastAPI (localhost)
└─ YOLOv8 inference (Ultralytics)
↓
JSON detections
↓
Browser overlay + text list

3️⃣ Install dependencies

pip install --upgrade pip
pip install ultralytics fastapi uvicorn python-multipart opencv-python