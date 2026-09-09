"use client";
import { useState } from "react";
import { Modal } from "./modal";
import { serializeFeedback } from "@/lib/feedback";
export function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState("");
  return (
    <Modal title="Playtest feedback" onClose={onClose}>
      <h1>How was your quest?</h1>
      <p>
        Download a JSON file to share with the team yourself. Nothing is
        submitted to a server. Your student ID is not included.
      </p>
      <p className="muted">
        Includes browser and viewport size. Leave out passwords, names and
        private information. Notes disappear when this dialog closes.
      </p>
      <form
        className="feedback-form"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          try {
            const json = serializeFeedback({
              rating: Number(data.get("rating")),
              positiveNotes: String(data.get("positiveNotes") ?? ""),
              confusingNotes: String(data.get("confusingNotes") ?? ""),
              bugNotes: String(data.get("bugNotes") ?? ""),
              suggestion: String(data.get("suggestion") ?? ""),
              deviceInfo: {
                browser: navigator.userAgent,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
              },
            });
            const link = document.createElement("a");
            // Bounded notes fit a self-contained download URL without a temporary object URL lifecycle.
            link.href =
              "data:application/json;charset=utf-8," + encodeURIComponent(json);
            link.download = `eastquest-feedback-${Date.now()}.json`;
            document.body.append(link);
            link.click();
            link.remove();
            setStatus(
              "Download requested. Check your downloads and share the file with the team. Nothing was submitted online.",
            );
          } catch (error) {
            setStatus(
              error instanceof Error
                ? error.message
                : "Export failed. Please try again.",
            );
          }
        }}
      >
        <label>
          Enjoyment rating (1 = low, 5 = high)
          <select name="rating" required defaultValue="">
            <option value="" disabled>
              Choose a rating
            </option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {[
          ["positiveNotes", "What felt good?"],
          ["confusingNotes", "What was confusing?"],
          ["bugNotes", "Bug description"],
          ["suggestion", "Improvement idea (optional)"],
        ].map(([name, label]) => (
          <label key={name}>
            {label}
            <textarea name={name} rows={3} maxLength={4000} />
          </label>
        ))}
        <button className="primary" type="submit">
          EXPORT FEEDBACK
        </button>
        <p role="status">{status}</p>
      </form>
    </Modal>
  );
}
