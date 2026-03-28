import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Detection {
  label: string;
  score: number;
  bbox: [number, number, number, number];
}

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [confidence, setConfidence] = useState(0.35);
  const [status, setStatus] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const resizeCanvas = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    }
  }, []);

  const drawDetections = useCallback((dets: Detection[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dets.forEach(det => {
      const [x1, y1, x2, y2] = det.bbox;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(`${det.label} ${det.score.toFixed(2)}`, x1, y1 - 5);
    });
  }, []);

  const captureAndDetect = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isRunning) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob);

      try {
        const response = await fetch(`http://127.0.0.1:8000/detect?conf=${confidence}`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setDetections(data.detections);
        drawDetections(data.detections);
        setStatus(`Detected ${data.detections.length} objects`);
      } catch (error) {
        console.error('Detection error:', error);
        setStatus('Detection failed');
      }
    }, 'image/jpeg');
  }, [isRunning, drawDetections]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(captureAndDetect, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, captureAndDetect]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', resizeCanvas);
      window.addEventListener('resize', resizeCanvas);
    }
    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', resizeCanvas);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const startDetection = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsRunning(true);
      setStatus('Started');
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setStatus('Failed to access webcam');
    }
  };

  const stopDetection = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRunning(false);
    setDetections([]);
    drawDetections([]);
    setStatus('Stopped');
  };

  return (
    <div style={{ fontFamily: 'system-ui', margin: '20px', maxWidth: '1100px' }}>
      <h1>Open Detection (Local YOLO with React)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'start' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: '14px', padding: '14px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '900px', aspectRatio: '16/9', background: '#000', borderRadius: '14px', overflow: 'hidden' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={startDetection} disabled={isRunning}>Start</button>
            <button onClick={stopDetection} disabled={!isRunning}>Stop</button>
            <label>
              Conf
              <input
                type="range"
                min="1"
                max="99"
                value={confidence * 100}
                onChange={(e) => setConfidence(parseInt(e.target.value) / 100)}
              />
            </label>
            <span>{status}</span>
          </div>
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: '14px', padding: '14px' }}>
          <h3>Detections</h3>
          <pre style={{ background: '#f6f6f6', borderRadius: '12px', padding: '10px', whiteSpace: 'pre-wrap' }}>
            {detections.length > 0
              ? detections.map((det, i) => `${det.label}: ${det.score.toFixed(2)}\n`).join('')
              : '(none)'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default App;