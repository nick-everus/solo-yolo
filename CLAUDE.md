# CLAUDE.md — solo-yolo

Rules and context for Claude Code working in this repository.

---

## What This Project Is

**solo-yolo** is a fully local, real-time object detection app.

- **Browser frontend** (`index.html`) captures webcam frames and draws bounding boxes + labels on a canvas overlay
- **Python backend** (`server.py`) runs a FastAPI server that accepts JPEG frames via HTTP POST and returns YOLO detections as JSON
- **Model** (`yolov8n.pt`) is the small YOLOv8 nano model — fast, local, no cloud calls

No build tooling. No framework. No data leaves the machine.

---

## Architecture

```
Browser (index.html)
  └─ Webcam → offscreen canvas → JPEG blob
  └─ POST http://127.0.0.1:8000/detect?conf=0.35
          ↓
FastAPI (server.py)
  └─ Decodes JPEG with OpenCV
  └─ Runs YOLOv8 inference (Ultralytics)
  └─ Returns JSON: { detections: [{label, score, bbox}] }
          ↓
Browser draws bounding boxes + labels on canvas
```

---

## File Map

| File | Purpose |
|---|---|
| `index.html` | Entire frontend — webcam, canvas overlay, detection loop, UI |
| `server.py` | FastAPI backend — receives frames, runs YOLO, returns JSON |
| `yolov8n.pt` | YOLOv8 nano model weights (do not delete or replace without testing) |
| `README.md` | Setup and usage docs |
| `.gitattributes` | Git LFS config for large model files |

---

## Rules

### Do
- Keep the frontend entirely in `index.html` (single file, no build step)
- Keep the backend in `server.py` (no splitting into modules unless the file exceeds ~300 lines)
- Use vanilla JS in the browser — no npm, no bundler, no framework
- Use Python standard library + the existing deps (FastAPI, Ultralytics, OpenCV, NumPy)
- Preserve the existing CORS middleware in `server.py` — it's required for local cross-origin requests
- Keep the model file as `yolov8n.pt` unless explicitly asked to upgrade the model

### Don't
- Don't add a `package.json`, `node_modules`, or any JS build tooling
- Don't add a `requirements.txt` unless explicitly asked (setup instructions live in README.md)
- Don't swap the model (`yolov8n.pt`) without confirming — changing model size affects performance significantly
- Don't add authentication, cloud storage, or any external data transmission
- Don't change the API contract (`POST /detect`, `?conf=` query param, JSON response shape) without updating the frontend at the same time

---

## Local Dev Setup (Mac)

```bash
# 1. Clone
git clone https://github.com/nick-everus/solo-yolo.git
cd solo-yolo

# 2. Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install deps (first run installs PyTorch — takes a few minutes)
pip install --upgrade pip
pip install ultralytics fastapi uvicorn python-multipart opencv-python

# 4. Start the backend
uvicorn server:app --reload --host 127.0.0.1 --port 8000

# 5. Serve the frontend (new terminal tab)
python3 -m http.server 5173

# 6. Open in browser
open http://127.0.0.1:5173/index.html
```

Click **Start**, allow camera permissions, done.

---

## Detection API

**Endpoint:** `POST http://127.0.0.1:8000/detect`

**Query param:** `?conf=0.35` (confidence threshold, 0.0–1.0)

**Body:** `multipart/form-data` with field `image` = JPEG blob

**Response:**
```json
{
  "detections": [
    {
      "label": "person",
      "score": 0.87,
      "bbox": [x1, y1, x2, y2]
    }
  ]
}
```

Bounding box coordinates are in pixels relative to the original frame size.

---

## Performance Notes

- The frontend polls at ~5 FPS (`setInterval(detectFrame, 200)`) — safe default for most Macs
- To increase FPS: lower the interval (e.g. `100` for ~10 FPS) but watch CPU/GPU usage
- `yolov8n.pt` is the nano model — fastest and smallest; `yolov8s.pt` or larger will be more accurate but slower
- Confidence threshold is adjustable via the slider in the UI (default 35%)

---

## Common Tasks

**Change detection confidence default:**
Edit `value="35"` on the `<input id="conf">` in `index.html`.

**Change inference FPS:**
Edit the `200` ms interval in `setInterval(detectFrame, 200)` in `index.html`.

**Swap to a larger YOLO model:**
Download the new `.pt` file, place it in the repo root, and update `YOLO("yolov8n.pt")` in `server.py`.

**Add a new API endpoint:**
Add a new `@app.post(...)` route in `server.py`. Keep CORS middleware in place.
