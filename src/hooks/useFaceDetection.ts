import { useEffect, useRef, useState } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

// MediaPipe FaceMesh indices for eye landmarks (468-point model)
// Left eye: 33 (outer), 160, 158, 133 (inner), 153, 144
// Right eye: 263 (outer), 387, 385, 362 (inner), 380, 373
const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [263, 387, 385, 362, 380, 373];

type Pt = { x: number; y: number };

function dist(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Eye Aspect Ratio (Soukupová & Čech)
function eyeAspectRatio(landmarks: Pt[], idx: number[]) {
  const p1 = landmarks[idx[0]];
  const p2 = landmarks[idx[1]];
  const p3 = landmarks[idx[2]];
  const p4 = landmarks[idx[3]];
  const p5 = landmarks[idx[4]];
  const p6 = landmarks[idx[5]];
  return (dist(p2, p6) + dist(p3, p5)) / (2.0 * dist(p1, p4));
}

export type FaceMetrics = {
  ear: number;
  faceDetected: boolean;
  faceBox: { x: number; y: number; w: number; h: number } | null;
  leftEye: Pt[] | null;
  rightEye: Pt[] | null;
  fps: number;
};

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<FaceMetrics>({
    ear: 0,
    faceDetected: false,
    faceBox: null,
    leftEye: null,
    rightEye: null,
    fps: 0,
  });
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(performance.now());
  const earSmoothRef = useRef(0.3);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm",
        );
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setReady(true);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Failed to load face model: ${msg}`);
      }
    })();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !ready) return;

    const tick = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      try {
        const result: FaceLandmarkerResult = landmarker.detectForVideo(
          video,
          performance.now(),
        );

        const now = performance.now();
        const dt = now - lastTickRef.current;
        lastTickRef.current = now;
        const fps = dt > 0 ? 1000 / dt : 0;

        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          const lm = result.faceLandmarks[0] as Pt[];
          const earL = eyeAspectRatio(lm, LEFT_EYE);
          const earR = eyeAspectRatio(lm, RIGHT_EYE);
          const ear = (earL + earR) / 2;
          // Exponential smoothing
          earSmoothRef.current = earSmoothRef.current * 0.6 + ear * 0.4;

          // Face bbox from landmarks
          let minX = 1, minY = 1, maxX = 0, maxY = 0;
          for (const p of lm) {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
          }

          setMetrics({
            ear: +earSmoothRef.current.toFixed(3),
            faceDetected: true,
            faceBox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
            leftEye: LEFT_EYE.map((i) => lm[i]),
            rightEye: RIGHT_EYE.map((i) => lm[i]),
            fps: Math.round(fps),
          });
        } else {
          setMetrics((m) => ({ ...m, faceDetected: false, faceBox: null, leftEye: null, rightEye: null, fps: Math.round(fps) }));
        }
      } catch {
        // ignore frame errors
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, ready, videoRef]);

  return { ready, error, metrics };
}
