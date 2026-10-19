export type Visitor = "recruiter" | "collab" | "client" | "friend";

export type ProjectId = "delulu" | "trip";

export type WinId =
  | "cv"
  | "projects"
  | "contact"
  | "trash"
  | "cvbuilder"
  | "music"
  | "music:guitar"
  | "music:piano"
  | "music:ukulele"
  | "garage"
  | "photos"
  | "youtube"
  | "note"
  | `project:${ProjectId}`
  | `browser:${ProjectId}`;

export type IconName =
  | "happymac"
  | "mac"
  | "doc"
  | "folder"
  | "mail"
  | "heart"
  | "trash"
  | "palette"
  | "palm"
  | "film"
  | "gift"
  | "passport"
  | "satellite"
  | "person"
  | "apple"
  | "caution"
  | "note"
  | "bomb"
  | "game"
  | "musicfolder"
  | "guitar"
  | "piano"
  | "ukulele"
  | "garage"
  | "globe"
  | "camera"
  | "play";
