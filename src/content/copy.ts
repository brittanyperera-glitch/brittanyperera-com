import type { IconName, Visitor, WinId } from "@/lib/types";
import { contact } from "./contact";
import { music } from "./music";
import { photos } from "./photos";
import { truths } from "./truths";
import { youtube } from "./youtube";

type MenuItem = { label: string; action?: string; open?: WinId };

// Brittany 2026-10-20: open only what suits the visitor; photos and CV always.
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
        sub: "it seems youve got into my computer. all the stuff is clickable, it is my computer of course. nosiness is welcome.",
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
    accent: "#3d6fb6",
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
    copyEmail: "copied my personal email! go on then",
    copyEmailFailed: `couldnt copy it, heres the address: ${contact.email}`,
    copyWorkEmail: "copied my work email! go on then",
    copyWorkEmailFailed: `couldnt copy it, heres the address: ${contact.workEmail}`,
    soundOn: "sound on. sorry in advance",
    leave: {
      text: "this opens in a new tab. come back after pls",
      cancel: "Cancel",
      ok: "Open",
    },
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
      title: "well, that broke.",
      text: "you found the button. restarting is the classic fix.",
      button: "Restart",
    },
    notFound: {
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
    { open: "projects", label: "Projects", icon: "folder" },
    { open: "music", label: music.folderTitle, icon: "musicfolder" },
    { open: "photos", label: photos.title, icon: "camera" },
    { open: "youtube", label: youtube.ui.title, icon: "play" },
    { open: "contact", label: "Contact", icon: "mail" },
    { open: "trash", label: "Trash", icon: "trash" },
    { open: "truths", label: truths.title, icon: "bubble" },
  ] as { open: WinId; label: string; icon: IconName }[],
  windowTitles: {
    cv: "CV.pdf",
    projects: "Projects",
    contact: "Say hi",
    trash: "Trash",
    music: music.folderTitle,
    garage: music.appName,
    photos: photos.title,
    youtube: youtube.ui.title,
    truths: truths.title,
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
    home: "Home",
    ok: "OK",
    soundOn: "Sound: on",
    soundOff: "Sound: off",
  },
  // Phone view (under 700px): a lock screen for a new visitor, then a home screen.
  phone: {
    statusName: "brittany",
    lock: {
      label: "Lock screen",
      from: "brittany",
      message:
        "it seems youve got into my phone. all the stuff is clickable, it is my phone of course. nosiness is welcome.",
      slide: "slide to come in",
    },
    who: {
      question: "who's visiting? ill put your stuff in the dock.",
      skip: "or skip it, everything's here anyway",
      picked: "{hint}, theyre in the dock",
    },
    dockLabel: "Dock",
    footer: "the full mac version is on a laptop",
    apps: ["cv", "projects", "music", "photos", "youtube", "truths", "contact", "trash"] as WinId[],
    // The four apps in the dock, left to right; the other apps sit in the grid above. "none" is
    // the dock before anyone has said who they are.
    docks: {
      none: ["cv", "projects", "music", "contact"],
      recruiter: ["cv", "projects", "contact", "photos"],
      collab: ["projects", "cv", "contact", "photos"],
      client: ["contact", "projects", "cv", "photos"],
      friend: ["youtube", "music", "photos", "cv"],
    } as Record<Visitor | "none", WinId[]>,
  },
  windows: {
    projectsInfo: "{n} items",
    openHint: "Double-click an icon (or select it and press Return) to open it.",
    copyEmail: "Copy personal email",
    copyWorkEmail: "Copy work email",
    workLabel: "work",
    personalLabel: "personal",
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
    "hi! the CV's open, have a look.",
    "my piano piece is in Garage, press play.",
    "everything else is on the desktop. double-click to poke around",
  ],
};
