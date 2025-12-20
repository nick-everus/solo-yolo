from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import numpy as np
import cv2

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("yolov8n.pt")  # small + fast

@app.post("/detect")
async def detect(image: UploadFile = File(...), conf: float = 0.35):
    data = await image.read()
    arr = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    results = model.predict(frame, conf=conf, verbose=False)[0]

    detections = []
    names = results.names
    if results.boxes is not None:
        for b in results.boxes:
            x1, y1, x2, y2 = b.xyxy[0].tolist()
            cls = int(b.cls[0].item())
            score = float(b.conf[0].item())
            detections.append({
                "label": names[cls],
                "score": score,
                "bbox": [x1, y1, x2, y2]
            })

    return {"detections": detections}