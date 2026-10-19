import type { IconName, Visitor, WinId } from "@/lib/types";

type MenuItem = { label: string; action?: string; open?: WinId };

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
      {
        title: "Appearance",
        sub: "pick a highlight colour. the iMac came in five flavours, so they're all here.",
      },
      { title: "Conclusion", sub: "all set. click Go Ahead and ill set up the Mac with:" },
    ],
    speech: [
      "hey hey! ill walk you through it",
      "be honest, who are you?",
      "the important decision",
      "thats it, promise",
    ],
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
    summaryColour: "Highlight colour:",
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
    copyEmailFailed: "couldnt copy it, heres the address: brittanykawshalya@gmail.com",
    soundOn: "sound on. sorry in advance",
    leave: {
      text: "this opens in a new tab. come back after pls",
      cancel: "Cancel",
      ok: "Open",
    },
    phone: "this is better on a laptop but go off",
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
    brittany: [
      { label: "About me", open: "about" },
      { label: "Say hi", open: "contact" },
    ] as MenuItem[],
    file: [
      { label: "Open CV", open: "cv" },
      { label: "Download CV (PDF)", action: "download" },
      { label: "Close all windows", action: "closeall" },
    ] as MenuItem[],
    view: [
      { label: "About me", open: "about" },
      { label: "Projects", open: "projects" },
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
    { open: "about", label: "About me", icon: "mac" },
    { open: "cv", label: "CV", icon: "doc" },
    { open: "projects", label: "Projects", icon: "folder" },
    { open: "contact", label: "Contact", icon: "mail" },
    { open: "trash", label: "Trash", icon: "trash" },
  ] as { open: WinId; label: string; icon: IconName }[],
  windowTitles: {
    about: "About me",
    cv: "CV.pdf",
    projects: "Projects",
    contact: "Say hi",
    trash: "Trash",
  } as Record<"about" | "cv" | "projects" | "contact" | "trash", string>,
  contactInvite: "want to work together, hire me, or just say hi?",
  firstWindows: {
    recruiter: ["about", "cv"],
    collab: ["about", "projects"],
    client: ["about", "contact"],
    friend: ["about"],
  } as Record<Visitor, WinId[]>,
};
