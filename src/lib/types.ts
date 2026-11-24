export type Visitor = "recruiter" | "collab" | "client" | "friend";

export type ProjectId = "delulu" | "trip" | "site" | "agents" | "engine" | "radiator";

export type WinId =
  | "cv"
  | "projects"
  | "contact"
  | "trash"
  | "music"
  | "garage"
  | "photos"
  | "youtube"
  | "truths"
  | "note"
  | `project:${ProjectId}`
  | "browser:trip";

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
  | "musicfolder"
  | "garage"
  | "globe"
  | "camera"
  | "play"
  | "bubble"
  | "engine"
  | "radiator";
