// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AlertProvider, useAlert } from "@/components/alert/AlertProvider";

function Harness({ onRun, onOther }: { onRun: () => void; onOther: () => void }) {
  const alert = useAlert();
  return (
    <>
      <button
        type="button"
        onClick={() =>
          alert({
            icon: "caution",
            body: "first alert",
            buttons: [{ label: "Cancel" }, { label: "Go", primary: true, run: onRun }],
          })
        }
      >
        open
      </button>
      <button
        type="button"
        onClick={() =>
          alert({ icon: "note", body: "second alert", buttons: [{ label: "Fine", run: onOther }] })
        }
      >
        open2
      </button>
    </>
  );
}

function setup() {
  const onRun = vi.fn();
  const onOther = vi.fn();
  render(
    <AlertProvider>
      <Harness onRun={onRun} onOther={onOther} />
    </AlertProvider>,
  );
  return { onRun, onOther, user: userEvent.setup() };
}

describe("alerts", () => {
  it("shows an alertdialog with the body and focuses the primary button", async () => {
    const { user } = setup();
    await user.click(screen.getByText("open"));
    const dlg = screen.getByRole("alertdialog");
    expect(dlg).toHaveTextContent("first alert");
    expect(dlg).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: "Go" })).toHaveFocus();
  });

  it("Enter runs the primary and closes; focus returns to the opener", async () => {
    const { user, onRun } = setup();
    const opener = screen.getByText("open");
    await user.click(opener);
    await user.keyboard("{Enter}");
    expect(onRun).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(opener).toHaveFocus();
  });

  it("Escape closes without running any button", async () => {
    const { user, onRun } = setup();
    const opener = screen.getByText("open");
    await user.click(opener);
    await user.keyboard("{Escape}");
    expect(onRun).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(opener).toHaveFocus();
  });

  it("a second alert replaces the first and focus still returns to the original opener", async () => {
    const { user, onRun, onOther } = setup();
    const opener = screen.getByText("open");
    await user.click(opener);
    expect(screen.getByRole("alertdialog")).toHaveTextContent("first alert");
    // Open the second programmatically so the opener button is not re-focused by a click.
    screen.getByText("open2").click();
    await screen.findByText("second alert");
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
    expect(screen.queryByText("first alert")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Fine" }));
    expect(onOther).toHaveBeenCalledTimes(1);
    expect(onRun).not.toHaveBeenCalled();
    expect(opener).toHaveFocus();
  });
});
