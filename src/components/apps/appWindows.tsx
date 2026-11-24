import type { ReactNode } from "react";
import type { WinId } from "@/lib/types";
import { GarageWindow } from "./GarageWindow";
import { MusicWindow } from "./MusicWindow";
import { PhotosWindow } from "./PhotosWindow";
import { YouTubeWindow } from "./YouTubeWindow";

/** Window body for each of the apps; page.tsx spreads this into the desktop's windows map. */
export const appWindows: Partial<Record<WinId, ReactNode>> = {
  music: <MusicWindow />,
  garage: <GarageWindow />,
  photos: <PhotosWindow />,
  youtube: <YouTubeWindow />,
};
