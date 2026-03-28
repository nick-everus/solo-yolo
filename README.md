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
- 🌐 React + TypeScript web UI + local Python backend

---

## 🧱 Architecture

Browser (React + TypeScript)
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

---

## ✅ Prerequisites (Mac)

- macOS + webcam
- Python 3.10+ recommended (`python3 --version`)
- Node.js 16+ (`node --version`)
- pip
- npm

> Note: `ultralytics` will install PyTorch. First install can take a few minutes.

---

## 🚀 Quick Start

## 1) Clone and enter the repo
```bash
git clone https://github.com/nick-everus/solo-yolo.git
cd solo-yolo
```
## Create a virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate
```
## Install dependencies
```bash
python -m pip install --upgrade pip
pip install ultralytics fastapi uvicorn python-multipart opencv-python
npm install
```
## 4) Start the FastAPI server
```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```
## 5) Start the React development server
```bash
npm run dev
```
## Now open your browser to
http://127.0.0.1:5173

## Click Start and allow camera permissions.