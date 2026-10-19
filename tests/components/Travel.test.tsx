// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TravelWindow } from "@/components/apps/TravelWindow";
import { travel } from "@/content/travel";

const places = [
  { name: "Lisbon", lat: 38.7, lon: -9.1, opinion: "hills and custard tarts" },
  { name: "Kyoto", lat: 35, lon: 135.8, opinion: "go in november" },
  { name: "Lima", lat: -12, lon: -77, opinion: "eat everything" },
];

const pin = (name: string) => screen.getByRole("button", { name });

describe("TravelWindow", () => {
  it("renders one pin per place, named by the place", () => {
    render(<TravelWindow places={places} />);
    for (const p of places) expect(pin(p.name)).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(places.length);
  });

  it("renders zero pins when there are no places", () => {
    render(<TravelWindow places={[]} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("shows no note until a pin is used", () => {
    render(<TravelWindow places={places} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText(places[0].opinion)).toBeNull();
  });

  it("Enter on a pin shows its opinion", async () => {
    const user = userEvent.setup();
    render(<TravelWindow places={places} />);
    pin("Kyoto").focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("go in november")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Kyoto" })).toBeInTheDocument();
  });

  it("clicking a pin shows its opinion", async () => {
    const user = userEvent.setup();
    render(<TravelWindow places={places} />);
    await user.click(pin("Lisbon"));
    expect(screen.getByText("hills and custard tarts")).toBeInTheDocument();
  });

  it("Esc closes the note and returns focus to its pin", async () => {
    const user = userEvent.setup();
    render(<TravelWindow places={places} />);
    await user.click(pin("Lima"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(pin("Lima")).toHaveFocus();
  });

  it("keeps only one note open at a time", async () => {
    const user = userEvent.setup();
    render(<TravelWindow places={places} />);
    await user.click(pin("Lisbon"));
    await user.click(pin("Kyoto"));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByText("go in november")).toBeInTheDocument();
    expect(screen.queryByText("hills and custard tarts")).toBeNull();
  });

  it("closes the note from its close button", async () => {
    const user = userEvent.setup();
    render(<TravelWindow places={places} />);
    await user.click(pin("Lisbon"));
    await user.click(screen.getByRole("button", { name: travel.ui.closeNote }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the empty hint when there are no places", () => {
    render(<TravelWindow places={[]} />);
    expect(screen.getByText(travel.ui.empty)).toBeInTheDocument();
  });
});
