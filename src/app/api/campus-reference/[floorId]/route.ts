import { readFile } from "node:fs/promises";
import path from "node:path";
import { floorById } from "@/game/data/campus/index";
/** Local development calibration only. Production never serves the architectural originals. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ floorId: string }> },
) {
  if (process.env.NODE_ENV !== "development")
    return new Response("Not found", { status: 404 });
  const floor = floorById((await params).floorId);
  if (!floor) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(
      path.join(
        process.cwd(),
        "references",
        "ewu-floorplans",
        new URL(request.url).searchParams.get("variant") === "color" &&
          floor.id !== "roof-deck"
          ? floor.source.replace(/\.png$/, "-color.png")
          : floor.source,
      ),
    );
    return new Response(data, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Reference unavailable", { status: 404 });
  }
}
