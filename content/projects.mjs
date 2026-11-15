/*
  PROJECTS
  ────────────────────────────────────────────────────────────────
  To add a project, copy the block below, paste it at the TOP of the
  list (newest first), and fill it in. That's it — the projects page,
  the tag filters and the home page all update themselves.

  {
    title: "Project name",
    description: "One or two sentences about what it does.",
    icon: "🚀",                       // emoji shown on the card
    accent: "cyan",                   // "cyan", "magenta" or "purple"
    tags: ["HTML", "JavaScript"],     // filter buttons are built from these
    featured: true,                   // optional: show in the Featured section
                                      //   of the Projects page and on the home page
    image: "/images/my-shot.png",     // optional: screenshot instead of the emoji
                                      //   (put the file in public/images/)
    links: [
      { type: "demo",     url: "/projects/my-project.html" },
      { type: "github",   url: "https://github.com/adelando/REPO" },
      { type: "download", url: "/projects/my-project/" },
    ],
  },

  Link notes
  • type is "demo", "github" or "download" (sets the icon and label).
  • Add  label: "Custom text"  to change the button text.
  • Leave url out to show the button greyed out as "coming soon".
  • Files for a demo go in public/projects/. The build warns you if a
    link points at a file that isn't there.
*/

export default [
  {
    title: "Homeward",
    description:
      "An app for iOS and Android that shows when events fall on your FIFO roster. Add birthdays and events and see which ones you'll have off. Built for FIFO workers by a FIFO worker.",
    icon: "🏠",
    accent: "cyan",
    tags: ["TypeScript", "PWA"],
    featured: true,
    links: [
      { type: "demo", url: "https://homeward.day", label: "Website" },
      { type: "github", url: "https://github.com/adelando/homeward" },
    ],
  },
  {
    title: "Gamified Health RPG",
    description:
      "Gamify your health with your Garmin stats and level up yourself! Coded with Claude from the ground up.",
    icon: "⚔️",
    accent: "magenta",
    tags: ["Python", "Garmin"],
    featured: true,
    links: [{ type: "github", url: "https://github.com/adelando/gamified-health-rpg" }],
  },
  {
    title: "Turnkeeper",
    description: "A gamified book RPG.",
    icon: "📖",
    accent: "purple",
    tags: ["Python", "RPG"],
    featured: true,
    links: [{ type: "github", url: "https://github.com/adelando/Turnkeeper" }],
  },
  {
    title: "Palette Forge — Colour Scheme Planner",
    description:
      "A helpful web app for designing colour palette schemes for projects, with colour visibility guidelines. Checks every colour against WCAG contrast levels, with presets, visuals and one-click CSS variables.",
    icon: "🎨",
    accent: "cyan",
    tags: ["HTML", "CSS", "JavaScript"],
    links: [{ type: "demo", url: "/projects/palette.html" }],
  },
  {
    title: "Glyph Painter",
    description:
      "A quick pixel editor for Nothing Phone (4a) Pro Glyph Matrix icons. Paint the 137-LED circular grid with bright, dim and off pixels, then export a PNG to upload as a custom Essential Notifications icon. Includes mirror drawing, undo, shifting and a saved-glyph library.",
    icon: "▦",
    accent: "magenta",
    tags: ["HTML", "CSS", "JavaScript", "Canvas"],
    links: [{ type: "demo", url: "/projects/glyph-painter.html" }],
  },
  {
    title: "Experiment Layers — v18.0 Multi-Layer",
    description:
      "An experimental audio visualizer that stacks two fully independent rendering layers — a base and a top layer — each with its own shape mode, sensitivity, and colour settings. Lets you blend complex patterns live from microphone or system audio input.",
    icon: "🎛️",
    accent: "purple",
    tags: ["HTML", "CSS", "JavaScript", "Audio Visualiser"],
    links: [
      { type: "demo", url: "/projects/experiment_layers.html" },
      { type: "github", url: "https://github.com/adelando/webpage-audio-visualizer" },
    ],
  },
  {
    title: "Visualizer v17.6.2",
    description:
      "The latest stable audio visualizer, adding a Neural Web mode and freeform Custom Text rendering on top of v17.5. Includes a full 9-slot preset history system, keyboard shortcuts, and a collapsible control panel — suitable for live VJ use.",
    icon: "🌀",
    accent: "cyan",
    tags: ["HTML", "CSS", "JavaScript", "Audio Visualiser"],
    links: [
      { type: "demo", url: "/projects/visualizer.html" },
      { type: "github", url: "https://github.com/adelando/webpage-audio-visualizer" },
    ],
  },
  {
    title: "Visualizer v17.5",
    description:
      "An interactive VJ tool that captures real-time system audio or microphone input and drives geometric synthesis across 9 shape modes — Starfield, Kaleidoscope, Orbiting Moons, Geometric Triangles, Pulsing Hexagons, Concentric Circles, Nested Squares, Mirror Bar, and Waveform. Full parameter control over gain, spacing, complexity, and rotation.",
    icon: "🔊",
    accent: "cyan",
    tags: ["HTML", "CSS", "JavaScript", "Audio Visualiser"],
    links: [
      { type: "demo", url: "/projects/17-5_stable.html" },
      { type: "github", url: "https://github.com/adelando/webpage-audio-visualizer" },
    ],
  },
  {
    title: "AI Chat Visualizer — Vortex",
    description:
      "A real-time canvas visualiser designed to reflect the live state of an AI assistant. Connects via Socket.IO and reacts to six states — idle, listening, thinking, talking, sleeping, and offline — each with a distinct particle animation and colour. Built as a visual front-end for a local AI setup.",
    icon: "🤖",
    accent: "purple",
    tags: ["HTML", "CSS", "JavaScript", "AI Chat", "Socket.IO"],
    links: [
      { type: "demo", url: "/projects/ai_chat_visualizer.html" },
      { type: "github" }, // no url yet = shown as "coming soon"
    ],
  },
  {
    title: "Drawbridge",
    description:
      "A canvas-based animation project released across multiple versioned builds. Each version is available as a downloadable zip with iterative improvements and bug fixes across v1, v2, and v3.",
    icon: "🌉",
    accent: "magenta",
    tags: ["HTML", "CSS", "JavaScript", "Canvas"],
    links: [{ type: "download", url: "/projects/drawbridge/", label: "Downloads" }],
  },
];
