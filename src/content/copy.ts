import type { IconName, Visitor, WinId } from "@/lib/types";
import { contact } from "./contact";
import { cvBuilder } from "./cvbuilder";
import { music } from "./music";
import { photos } from "./photos";
import { youtube } from "./youtube";

type MenuItem = { label: string; action?: string; open?: WinId };

// Brittany 2026-10-20: open only what suits the visitor; photos and CV always, CV Builder never.
// Back to front; the Stickies note sits above all but the visitor's main window, always last.
const ALWAYS: WinId[] = ["photos", "note"];

export const copy = {
  boot: {
    name: "Brittany's Mac",
    status: "Starting Up…",
    hint: "click or press Esc to skip",
  },
  setup: {
    windowTitle: "Brittany's Setup Assistant",
    skip: "Skip",
    back: "‹ Go Back",
    next: "Continue ›",
    goAhead: "Go Ahead",
    steps: [
      {
        title: "Introduction",
        sub: "this assistant sets up my Mac for you. takes about 20 seconds, or skip it (no hard feelings).",
      },
      { title: "About You", sub: "who's visiting? ill open the right stuff first." },
      { title: "Conclusion", sub: "all set. click Go Ahead and ill set up the Mac with:" },
    ],
    speech: ["", "be honest, who are you?", "thats it, promise"],
    hello: [
      { text: "hello", lang: "en" },
      { text: "ආයුබෝවන්", lang: "si" },
      { text: "bonjour", lang: "fr" },
      { text: "hallo", lang: "de" },
    ],
    visitors: [
      { id: "recruiter", label: "I'm hiring", hint: "CV and background first" },
      { id: "collab", label: "Let's build something", hint: "straight to projects" },
      { id: "client", label: "I have a project", hint: "how to reach me" },
      { id: "friend", label: "Friend / just nosy", hint: "the fun stuff" },
    ] as { id: Visitor; label: string; hint: string }[],
    swatches: [
      { name: "Blueberry", hex: "#3d6fb6" },
      { name: "Bondi Blue", hex: "#2f8aa3" },
      { name: "Tangerine", hex: "#c9772f" },
      { name: "Strawberry", hex: "#b8475f" },
      { name: "Grape", hex: "#6e55a8" },
      { name: "Lime", hex: "#5f8f35" },
      { name: "Graphite", hex: "#5e6670" },
    ],
    summaryVisitor: "Visitor:",
    count: "{n} of {total}",
    installLines: [
      "welding playground frames in Kurunegala…",
      "cooling an F1 radiator…",
      "washing jet engines…",
      "downloading satellite imagery of Earth…",
      "counting Schengen days…",
      "settling a group-trip argument…",
      "done!",
    ],
    portraitAlt: "Brittany",
  },
  alerts: {
    emptyTrash: {
      text: "are you sure you want to permanently delete my mistakes? (im not)",
      keep: "Keep them",
      empty: "Empty Trash",
      after: "nice try. theyre load bearing",
    },
    restart: {
      text: "restart? youll have to tell me who you are again",
      cancel: "Cancel",
      ok: "Restart",
    },
    download: "downloading CV.pdf (me, minus the personality)",
    copyEmail: "copied! go on then",
    copyEmailFailed: `couldnt copy it, heres the address: ${contact.email}`,
    soundOn: "sound on. sorry in advance",
    leave: {
      text: "this opens in a new tab. come back after pls",
      cancel: "Cancel",
      ok: "Open",
    },
    phone: "might be better on laptop btw",
    aboutMac: {
      title: "Brittany's Mac",
      specs: [
        "Built in: Torquay",
        "Upgraded at: Oxford",
        "Languages: English, Sinhala, French (ish), German (ish)",
        "Installed: Python, TypeScript, too many side projects",
      ],
    },
    crash: {
      title: "Sorry, a system error occurred.",
      text: "(this page doesnt exist, or i broke it)",
      button: "Restart",
    },
  },
  menus: {
    apple: [
      { label: "About Brittany's Mac", action: "aboutmac" },
      { label: "Restart setup", action: "restart" },
    ] as MenuItem[],
    brittany: [{ label: "Say hi", open: "contact" }] as MenuItem[],
    file: [
      { label: "Open CV", open: "cv" },
      { label: "Download CV (PDF)", action: "download" },
      { label: "Close all windows", action: "closeall" },
    ] as MenuItem[],
    view: [
      { label: "Projects", open: "projects" },
      { label: music.folderTitle, open: "music" },
      { label: photos.title, open: "photos" },
      { label: youtube.ui.title, open: "youtube" },
      { label: cvBuilder.title, open: "cvbuilder" },
      { label: "Contact", open: "contact" },
      { label: "Trash", open: "trash" },
    ] as MenuItem[],
    special: [
      { label: "Empty Trash…", action: "emptytrash" },
      { label: "Restart setup", action: "restart" },
      { label: "Break something", action: "crash" },
    ] as MenuItem[],
  },
  desktopIcons: [
    { open: "cv", label: "CV", icon: "doc" },
    { open: "cvbuilder", label: cvBuilder.title, icon: "game" },
    { open: "projects", label: "Projects", icon: "folder" },
    { open: "music", label: music.folderTitle, icon: "musicfolder" },
    { open: "photos", label: photos.title, icon: "camera" },
    { open: "youtube", label: youtube.ui.title, icon: "play" },
    { open: "contact", label: "Contact", icon: "mail" },
    { open: "trash", label: "Trash", icon: "trash" },
  ] as { open: WinId; label: string; icon: IconName }[],
  windowTitles: {
    cv: "CV.pdf",
    projects: "Projects",
    contact: "Say hi",
    trash: "Trash",
    cvbuilder: cvBuilder.title,
    music: music.folderTitle,
    "music:guitar": music.instruments[0].name,
    "music:piano": music.instruments[1].name,
    "music:ukulele": music.instruments[2].name,
    garage: music.appName,
    photos: photos.title,
    youtube: youtube.ui.title,
    note: "Start here",
  } as Record<Exclude<WinId, `project:${string}` | `browser:${string}`>, string>,
  chrome: {
    menuTitles: {
      apple: "Apple menu",
      brittany: "Brittany",
      file: "File",
      view: "View",
      special: "Special",
    },
    close: "Close",
    back: "‹ Back",
    closeLabel: "Close",
    ok: "OK",
    soundOn: "Sound: on",
    soundOff: "Sound: off",
  },
  windows: {
    projectsInfo: "{n} items",
    openHint: "Double-click an icon (or select it and press Return) to open it.",
    cvPageLink: "the full CV, as a page",
    copyEmail: "Copy email",
    github: "GitHub",
    linkedin: "LinkedIn",
  },
  contactInvite: "want to work together, hire me, or just say hi?",
  // Opened in order, so the last is in front (and is the one window a phone shows).
  firstWindows: {
    recruiter: [...ALWAYS, "cv"],
    collab: [...ALWAYS, "cv", "projects"],
    client: [...ALWAYS, "cv", "contact"],
    friend: ["youtube", "garage", ...ALWAYS, "cv"],
  } as Record<Visitor, WinId[]>,
  // The Stickies note open on the desktop after setup. Every visitor sees it, so it names only the CV.
  note: [
    "hi! the CV's open, or play CV Builder and it builds it for you.",
    "my piano piece is in Garage, press play.",
    "everything else is on the desktop. double-click to poke around",
  ],
};
