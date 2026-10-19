import type { ReactNode } from "react";
import type { WinId } from "@/lib/types";
import { CvBuilderWindow } from "./CvBuilderWindow";
import { GarageWindow } from "./GarageWindow";
import { InstrumentWindow } from "./InstrumentWindow";
import { MusicWindow } from "./MusicWindow";
import { PhotosWindow } from "./PhotosWindow";
import { YouTubeWindow } from "./YouTubeWindow";

/** Window body for each of the apps; page.tsx spreads this into the desktop's windows map. */
export const appWindows: Partial<Record<WinId, ReactNode>> = {
  cvbuilder: <CvBuilderWindow />,
  music: <MusicWindow />,
  "music:guitar": <InstrumentWindow id="guitar" />,
  "music:piano": <InstrumentWindow id="piano" />,
  "music:ukulele": <InstrumentWindow id="ukulele" />,
  garage: <GarageWindow />,
  photos: <PhotosWindow />,
  youtube: <YouTubeWindow />,
};
