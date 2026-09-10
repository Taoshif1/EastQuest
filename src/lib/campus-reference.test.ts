import { afterEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { GET } from "@/app/api/campus-reference/[floorId]/route";
vi.mock("node:fs/promises", () => ({ readFile: vi.fn() }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("architectural reference protection", () => {
  it("returns 404 in production before reading any reference", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = await GET(
      new Request("http://localhost/api/campus-reference/ground?variant=color"),
      { params: Promise.resolve({ floorId: "ground" }) },
    );
    expect(response.status).toBe(404);
    expect(readFile).not.toHaveBeenCalled();
  });
  it("rejects an unregistered floor instead of resolving user input as a path", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const response = await GET(
      new Request("http://localhost/api/campus-reference/unknown"),
      { params: Promise.resolve({ floorId: "../../.env.local" }) },
    );
    expect(response.status).toBe(404);
    expect(readFile).not.toHaveBeenCalled();
  });
});
