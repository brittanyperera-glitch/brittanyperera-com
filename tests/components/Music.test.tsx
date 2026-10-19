// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GarageWindow } from "@/components/apps/GarageWindow";
import { InstrumentWindow } from "@/components/apps/InstrumentWindow";
import { Desktop, useDesktop } from "@/components/desktop/Desktop";
import { music } from "@/content/music";

const track = { src: "/music/fixture.mp3", title: "Fixture tune" };
const instruments = [
  { id: "guitar", name: "Fixture guitar", icon: "guitar", line: "a fixture line" },
  { id: "piano", name: "Fixture piano", icon: "piano", line: "" },
] as typeof music.instruments;

const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();
beforeEach(() => {
  play.mockClear();
  pause.mockClear();
  HTMLMediaElement.prototype.play = play;
  HTMLMediaElement.prototype.pause = pause;
});
afterEach(() => vi.restoreAllMocks());

describe("InstrumentWindow", () => {
  it("shows the instrument name and its line", () => {
    render(<InstrumentWindow id="guitar" instruments={instruments} />);
    expect(screen.getByRole("heading", { level: 3, name: "Fixture guitar" })).toBeInTheDocument();
    expect(screen.getByText("a fixture line")).toBeInTheDocument();
  });

  it("renders no line paragraph when the line is empty", () => {
    const { container } = render(<InstrumentWindow id="piano" instruments={instruments} />);
    expect(screen.getByRole("heading", { level: 3, name: "Fixture piano" })).toBeInTheDocument();
    expect(container.querySelector("p")).toBeNull();
  });

  it("draws a 64px pixel icon", () => {
    const { container } = render(<InstrumentWindow id="guitar" instruments={instruments} />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "64");
  });
});

function Opener() {
  const { open } = useDesktop();
  return (
    <button type="button" onClick={() => open("garage")}>
      test-open-garage
    </button>
  );
}

function mount(t?: (typeof track & { note?: string }) | null) {
  render(
    <Desktop windows={{ garage: <GarageWindow track={t} /> }}>
      <Opener />
    </Desktop>,
  );
  return userEvent.setup();
}

const audio = () => document.querySelector("audio") as HTMLAudioElement;
function setDuration(el: HTMLAudioElement, seconds: number) {
  Object.defineProperty(el, "duration", { configurable: true, value: seconds });
  act(() => {
    fireEvent.loadedMetadata(el);
  });
}

describe("GarageWindow", () => {
  it("renders the title and every control, with no autoplay", async () => {
    const user = mount(track);
    await user.click(screen.getByText("test-open-garage"));
    expect(screen.getByText("Fixture tune")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: music.ui.play })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: music.ui.position })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: music.ui.volume })).toBeInTheDocument();
    expect(audio()).toHaveAttribute("src", track.src);
    expect(audio()).toHaveAttribute("preload", "metadata");
    expect(audio().autoplay).toBe(false);
    expect(play).not.toHaveBeenCalled();
  });

  it("shows the track note under the title when there is one, and none otherwise", async () => {
    const user = mount({ ...track, note: "a fixture note" });
    await user.click(screen.getByText("test-open-garage"));
    expect(screen.getByText("a fixture note")).toBeInTheDocument();
  });

  it("renders no note element for a track without a note", async () => {
    const user = mount(track);
    await user.click(screen.getByText("test-open-garage"));
    expect(document.querySelector(".garage-note")).toBeNull();
  });

  it("Play calls play() and toggles to Pause, which calls pause()", async () => {
    const user = mount(track);
    await user.click(screen.getByText("test-open-garage"));
    await user.click(screen.getByRole("button", { name: music.ui.play }));
    expect(play).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: music.ui.pause }));
    expect(pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: music.ui.play })).toBeInTheDocument();
  });

  it("scrubbing sets currentTime and shows elapsed and total time", async () => {
    const user = mount(track);
    await user.click(screen.getByText("test-open-garage"));
    setDuration(audio(), 125);
    expect(screen.getByText("2:05")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider", { name: music.ui.position }), {
      target: { value: "42" },
    });
    expect(audio().currentTime).toBe(42);
    expect(screen.getByText("0:42")).toBeInTheDocument();
  });

  it("volume slider sets the audio volume", async () => {
    const user = mount(track);
    await user.click(screen.getByText("test-open-garage"));
    fireEvent.change(screen.getByRole("slider", { name: music.ui.volume }), {
      target: { value: "0.4" },
    });
    expect(audio().volume).toBeCloseTo(0.4);
  });

  it("closing the window pauses playback", async () => {
    const user = mount(track);
    await user.click(screen.getByText("test-open-garage"));
    await user.click(screen.getByRole("button", { name: music.ui.play }));
    pause.mockClear();
    const win = screen.getByLabelText(music.appName, { selector: "section" });
    await user.click(win.querySelector(".close") as HTMLElement);
    expect(win).toHaveAttribute("hidden");
    expect(pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: music.ui.play, hidden: true })).toBeInTheDocument();
  });

  it("renders only the app title, and no audio element, when there is no track", async () => {
    // null means "no track"; undefined would fall back to the real content track.
    const user = mount(null);
    await user.click(screen.getByText("test-open-garage"));
    expect(screen.getByRole("heading", { level: 3, name: music.appName })).toBeInTheDocument();
    expect(audio()).toBeNull();
    expect(screen.queryByRole("slider")).toBeNull();
  });
});
