import { version } from "../../package.json";
// One release version keeps menus, diagnostics and feedback exports in agreement.
export const APP_VERSION = version;
export const RELEASE_LABEL = "Team / closed playtest build";
export function isDebugMode(search: string): boolean {
  const values = new URLSearchParams(search).getAll("debug");
  return values.length === 1 && values[0] === "1";
}
