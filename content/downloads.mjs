/*
  DOWNLOADS — Minecraft world archives
  ────────────────────────────────────────────────────────────────
  Each server has a list of versions. To add a version, copy one of
  the { ... } rows and edit it.

  Version fields
    name         "1.18" — shown as "Version 1.18"
    size         "616.7 MB"                (leave out = "Coming soon")
    worlds       "Mainworld, Superflat"    (leave out = "List coming soon")
    excludes     optional
    note         optional
    download     URL of the archive. Leave out = greyed-out "Coming soon".
    resourcepack URL of the resource pack, or "soon" for a greyed-out
                 button. Leave out for no resource pack button.

  Server fields
    image        optional picture shown beside the server name
                 (put the file in public/images/). Falls back to the icon.
*/

export default [
  {
    id: "aydaacraft",
    name: "Aydaacraft",
    icon: "🔮",
    accent: "cyan",
    image: "/images/dl_ac_server.png",
    description:
      "A survival exploration server with custom features, running across multiple versions. Download any world backup below.",
    versions: [
      {
        name: "1.14 – 1.16",
        worlds: "Spawn, Overworld, Realm, Skylands, Plots",
        excludes: "Skyblock Overworld, S.B Nether, S.B End",
      },
      { name: "1.17.x", resourcepack: "soon" },
      { name: "1.18", note: "Resourcepack required for full textures", resourcepack: "soon" },
      { name: "1.19.x", note: "Resourcepack required for full textures", resourcepack: "soon" },
      { name: "1.x.x" },
    ],
    install: [
      "Select your version and download the archive.",
      "Unzip the archive and pick the worlds you want to play.",
      "Drag and drop the world folder into `.minecraft/saves`.",
      "Open the Minecraft Launcher and create or switch to a profile matching the downloaded version.",
      "Launch Minecraft, go to Singleplayer, find your world, then Edit and Game Rules.",
      "Set `doFireTick` and `doTNTDamage` to false, then press Play!",
    ],
  },
  {
    id: "creativitycraft",
    name: "CreativityCraft",
    icon: "❄️",
    accent: "magenta",
    image: "/images/dl_cc_server.png",
    description:
      "A free-roam Minecraft creative server originally hosted on 1.14. Download world archives spanning all active versions.",
    versions: [
      { name: "1.4.7", size: "616.7 MB", worlds: "Mainworld, Superflat" },
      { name: "1.5.2", size: "1.3 GB" },
      { name: "1.6.4", size: "612.2 MB" },
      { name: "1.7.10", size: "1.3 GB" },
      { name: "1.8.1", size: "352.7 MB" },
    ],
    install: [
      "Download your preferred version archive.",
      "Unzip and place the world folder into `.minecraft/saves`.",
      "Use a launcher profile (e.g. MultiMC or official) that matches the version number.",
      "Launch Minecraft, go to Singleplayer, select the world and enjoy!",
    ],
  },
];
