import { youtube } from "./youtube";

/** "https://www.x.com/a/" -> "x.com/a": the visible handle, derived so each URL lives in one place. */
export const handleOf = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export const contact = {
  workEmail: "brittany@pangeai.com",
  email: "brittanykawshalya@gmail.com",
  github: "https://github.com/brittanyperera-glitch",
  linkedin: "https://www.linkedin.com/in/brittany-perera-a6bb32219/" as string | undefined,
  youtube: youtube.channelUrl,
};
