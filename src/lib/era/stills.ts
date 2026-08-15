/** ERA marketing stills — local first, Squarespace CDN fallback for deploys. */
const CDN = "https://images.squarespace-cdn.com/content/v1/68d7878b0716e15b9f018341";

export const stills = {
  meet: "/era/space-meet.jpg",
  wide: "/era/hero-wide.jpg",
  portrait: "/era/hero-portrait.jpg",
  floor: "/era/space-floor.jpg",
  night: "/era/space-night.jpg",
  david: "/era/david.jpg",
  henry: "/era/henry.jpg",
  cdn: {
    meet: `${CDN}/c743dc17-eee7-4e04-b873-9be7521fc381/Sega-Meet-Outdoors-7619.jpg?format=2000w`,
    wide: `${CDN}/bef087c3-bdd1-4039-ab95-a033cc30868e/Headland-9-MidRes-aspect-ratio-3840-2160.jpeg?format=2500w`,
    portrait: `${CDN}/27b3cc6c-b199-46de-8f51-2264ba19a1ae/Headland-15-MidRes-aspect-ratio-2640-1980.jpeg?format=1500w`,
    floor: `${CDN}/e2bee60d-54d5-4918-a1b7-798a2cfd161c/Oct-Era-1.jpg?format=2000w`,
    night: `${CDN}/5ef4b4dc-f77e-4f56-bb0a-309573d4b959/VILE1045-vb.jpg?format=2000w`,
    david: `${CDN}/4fa27393-ee9a-4dad-8577-3b171288bb9a/David-E-Pass-003-v3.2.jpg?format=800w`,
    henry: `${CDN}/e7ba797d-c071-4aff-8d9c-71a680775817/001b-Pass-Henry-G-Pass.jpg?format=800w`,
  },
} as const;
