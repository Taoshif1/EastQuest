"use client";
import "@/components/game/campus.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { checkpoints, payloadText } from "@/game/verification/checkpoints";

export default function CheckpointsPage() {
  const checkpoint = checkpoints[0];
  const [image, setImage] = useState("");
  const payload = payloadText(checkpoint);
  useEffect(() => {
    void QRCode.toDataURL(payload, { margin: 2, width: 280 }).then(setImage);
  }, [payload]);
  return (
    <main className="dev-checkpoint">
      <p>TEST CHECKPOINT</p>
      <h1>{checkpoint.displayName}</h1>
      <h2>Library</h2>
      <p>Block B · Fifth Floor</p>
      {image && (
        <Image
          src={image}
          alt="Library test checkpoint QR code"
          width={280}
          height={280}
          unoptimized
        />
      )}
      <pre>{payload}</pre>
      <small>Development/team testing only. Static QR codes can be copied or shared.</small>
    </main>
  );
}
