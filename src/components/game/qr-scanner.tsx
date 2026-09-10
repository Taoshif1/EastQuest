"use client";
import { useEffect, useRef, useState } from "react";

type ScannerStatus = "loading" | "active" | "error";
type BarcodeDetectorLike = {
  detect(video: HTMLVideoElement): Promise<Array<{ rawValue?: string }>>;
};
type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorLike;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export function QrScanner({
  onScan,
  onClose,
}: {
  onScan: (value: string) => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const controls = useRef<{ stop(): void } | null>(null);
  const frame = useRef<number | null>(null);
  const [status, setStatus] = useState<ScannerStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const stop = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      controls.current?.stop();
      controls.current = null;
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      if (video.current) video.current.srcObject = null;
    };
    const fail = (message: string) => {
      stop();
      if (active) {
        setStatus("error");
        setError(message);
      }
    };
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        fail("Camera access is unavailable in this browser.");
        return;
      }
      try {
        const camera = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (!active || !video.current) {
          camera.getTracks().forEach((track) => track.stop());
          return;
        }
        stream.current = camera;
        video.current.srcObject = camera;
        await video.current.play();
        if (window.BarcodeDetector) {
          const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
          setStatus("active");
          const detect = async () => {
            if (!active || !video.current) return;
            try {
              const codes = await detector.detect(video.current);
              const value = codes[0]?.rawValue;
              if (value) {
                stop();
                onScan(value);
                return;
              }
            } catch {
              fail("The camera could not read this QR code.");
              return;
            }
            frame.current = requestAnimationFrame(() => void detect());
          };
          void detect();
          return;
        }
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();
        setStatus("active");
        controls.current = await reader.decodeFromVideoDevice(
          undefined,
          video.current,
          (result) => {
            const value = result?.getText();
            if (value) {
              stop();
              onScan(value);
            }
          },
        );
      } catch (cause) {
        const name = cause instanceof DOMException ? cause.name : "";
        fail(
          name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access or cancel to continue."
            : "No usable camera was found. You can cancel and keep playing.",
        );
      }
    };
    void start();
    return () => {
      active = false;
      stop();
    };
  }, [onScan]);

  return (
    <div className="qr-scanner">
      {status !== "error" && (
        <div className="qr-preview">
          <video ref={video} muted playsInline />
          <span className="qr-frame" aria-hidden="true" />
        </div>
      )}
      {status === "loading" && <p className="muted">Requesting camera access…</p>}
      {status === "active" && <p className="muted">Point the camera at an EastQuest checkpoint.</p>}
      {status === "error" && <p className="error" role="alert">{error}</p>}
      <button className="secondary" onClick={onClose}>Cancel</button>
    </div>
  );
}
