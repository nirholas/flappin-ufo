import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the title screen on mount", async () => {
    render(<App />);
    expect(await screen.findByText(/tap to play/i)).toBeInTheDocument();
    // Title is rendered twice for a layered shadow effect.
    expect(screen.getAllByText("FLAPPIN")).toHaveLength(2);
  });

  it("dismisses the title screen when tapped, revealing the score HUD", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByText(/tap to play/i));
    expect(screen.queryByText(/tap to play/i)).not.toBeInTheDocument();
    expect(screen.getByText(/score:/i)).toBeInTheDocument();
  });
});
