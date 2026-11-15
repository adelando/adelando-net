/*
  SITE SETTINGS — name, menu, home page text, About page
  ────────────────────────────────────────────────────────────────
  Everything on the Home and About pages that isn't a project or a
  download lives here.
*/

export default {
  name: "Adelando.net",
  url: "https://adelando.net",
  githubUser: "adelando",
  supportUrl: "https://www.buymeacoffee.com/adelando",

  // Top menu and footer links, in order.
  nav: [
    { label: "Projects", href: "/projects" },
    { label: "Downloads", href: "/downloads" },
    { label: "About", href: "/about" },
  ],

  home: {
    headline: "I build the things I can't find online.",
    intro:
      "A personal hub for open-source projects, Minecraft server world archives, and everything I've built along the way.",
  },

  about: {
    name: "Adelando",
    aka: ["Adeland6", "LeftRightShift"],
    photo: "/images/profile.png", // put the file in public/images/
    tagline:
      "Australian coder, Minecraft server hoster, and open-source experimenter. I build projects to fill voids that either don't exist or aren't easy to set up — putting AI to good use 🤖.",

    facts: [
      {
        icon: "🇦🇺",
        title: "Based in Australia",
        text: "Australian mines worker by day, coder and occasional vibe coder by night. Building things from down under.",
      },
      {
        icon: "🔧",
        title: "Problem solver",
        text: "Building projects that fill a void I can't seem to find online. Hoping one day my projects will help someone else.",
      },
      {
        icon: "🎮",
        title: "Minecraft enthusiast",
        text: "Long-time Minecraft lover and server hoster. World archives from previous Minecraft servers Aydaacraft and CreativityCraft are available to download.",
      },
      {
        icon: "🧪",
        title: "Open-source tinkerer",
        text: "Running experiments with open-source software at home — from self-hosted services to custom tooling and integrations.",
      },
      {
        icon: "🤖",
        title: "AI for good",
        text: "Exploring how AI can be used constructively — building tools, automating workflows, and augmenting creativity responsibly. Like this website!",
      },
      {
        icon: "💻",
        title: "Always building",
        text: "My mind never rests until the project in my mind is completed. Always building, always being creative.",
      },
    ],

    platformsNote: "Where to find me across the internet. I don't accept requests on gaming services.",

    // icon: discord, youtube, x, playstation, xbox, steam, epic or github.
    // Leave url out and the row shows the username without a link.
    platforms: [
      { icon: "discord", name: "Discord", username: "adelando", note: "No friend requests." },
      { icon: "youtube", name: "YouTube", username: "@adeland6", note: "Post random stuff.", url: "https://youtube.com/@adeland6" },
      { icon: "x", name: "X / Twitter", username: "@TheAdelando", note: "Posts are rare.", url: "https://x.com/theadelando" },
      { icon: "playstation", name: "PlayStation", username: "@adeland6", note: "No friend requests.", url: "https://profile.playstation.com/Adeland6" },
      { icon: "xbox", name: "Xbox", username: "@adeland6", note: "No friend requests.", url: "https://xbox.com/en-AU/play/user/Adeland6" },
      { icon: "steam", name: "Steam", username: "@adelando", note: "No friend requests." },
      { icon: "epic", name: "Epic Games", username: "@adelando", note: "No friend requests." },
      { icon: "github", name: "GitHub", username: "@adelando", note: "Every public repo is on my Projects page.", url: "https://github.com/adelando" },
    ],
  },
};
