export interface PlaytestFeedback {
  schemaVersion: 1;
  version: string;
  studentId?: string;
  deviceInfo: {
    browser: string;
    viewportWidth: number;
    viewportHeight: number;
  };
  rating: number;
  positiveNotes: string;
  confusingNotes: string;
  bugNotes: string;
  suggestion: string;
  createdAt: string;
}
