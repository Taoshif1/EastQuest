import { APP_VERSION } from "./app-info";
import type { PlaytestFeedback } from "@/types/feedback";
type FeedbackInput = Pick<
  PlaytestFeedback,
  | "rating"
  | "positiveNotes"
  | "confusingNotes"
  | "bugNotes"
  | "suggestion"
  | "deviceInfo"
>;
/** Explicit fields avoid exporting profile data or storage accidentally.
 * Local JSON can map to a future table without pretending a server received it. */
export function serializeFeedback(
  input: FeedbackInput,
  now = new Date(),
): string {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)
    throw new Error("Choose a rating from 1 to 5.");
  const feedback: PlaytestFeedback = {
    schemaVersion: 1,
    version: APP_VERSION,
    deviceInfo: {
      browser: input.deviceInfo.browser.slice(0, 500),
      viewportWidth: input.deviceInfo.viewportWidth,
      viewportHeight: input.deviceInfo.viewportHeight,
    },
    rating: input.rating,
    positiveNotes: input.positiveNotes.trim().slice(0, 4000),
    confusingNotes: input.confusingNotes.trim().slice(0, 4000),
    bugNotes: input.bugNotes.trim().slice(0, 4000),
    suggestion: input.suggestion.trim().slice(0, 4000),
    createdAt: now.toISOString(),
  };
  return JSON.stringify(feedback, null, 2);
}
