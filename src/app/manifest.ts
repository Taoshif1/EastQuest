import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EastQuest",
    short_name: "EastQuest",
    description:
      "Your Campus. Your Quest. Student-built campus exploration prototype.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: "#152c29",
    background_color: "#152c29",
    icons: [192, 512].map((size) => ({
      src: `/icons/icon-${size}.png`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any",
    })),
  };
}
