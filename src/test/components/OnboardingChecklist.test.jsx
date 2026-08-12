import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingChecklist from "../../components/OnboardingChecklist/OnboardingChecklist";

describe("OnboardingChecklist", () => {
  describe("progress", () => {
    it("reports how far along the user is", () => {
      render(<OnboardingChecklist count={2} />);

      expect(screen.getByText("2 of 3 artists picked")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    });

    it("counts a filled dot per artist picked", () => {
      const { container } = render(<OnboardingChecklist count={2} />);

      const dots = container.querySelectorAll('[class*="dot"]');
      const filled = [...dots].filter((d) => d.className.includes("dotOn"));
      expect(dots).toHaveLength(3);
      expect(filled).toHaveLength(2);
    });

    it("changes the prompt as the user gets closer", () => {
      const { rerender } = render(<OnboardingChecklist count={0} />);
      expect(screen.getByText(/pick three artists/i)).toBeInTheDocument();

      rerender(<OnboardingChecklist count={1} />);
      expect(screen.getByText(/two more/i)).toBeInTheDocument();

      rerender(<OnboardingChecklist count={2} />);
      expect(screen.getByText(/one more/i)).toBeInTheDocument();
    });

    it("never over-counts if the list somehow exceeds the target", () => {
      render(<OnboardingChecklist count={9} />);

      expect(screen.getByText("3 of 3 artists picked")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
    });

    it("opens the artist picker", async () => {
      const onAddArtist = vi.fn();
      render(<OnboardingChecklist count={1} onAddArtist={onAddArtist} />);

      await userEvent.click(screen.getByRole("button", { name: /add artist/i }));

      expect(onAddArtist).toHaveBeenCalled();
    });

    it("can be skipped", async () => {
      const onDismiss = vi.fn();
      render(<OnboardingChecklist count={1} onDismiss={onDismiss} />);

      await userEvent.click(screen.getByRole("button", { name: /skip/i }));

      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe("analyzing", () => {
    it("replaces the progress view while the analysis runs", () => {
      render(<OnboardingChecklist count={3} analyzing />);

      expect(screen.getByText(/reading your taste/i)).toBeInTheDocument();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /skip/i })).not.toBeInTheDocument();
    });
  });

  describe("reveal", () => {
    const personality = {
      title: "Dusty Fingers",
      description: "You dig for the loop before the song.",
    };

    it("shows the personality, and takes precedence over analyzing", () => {
      render(<OnboardingChecklist count={3} analyzing reveal={personality} />);

      expect(screen.getByText("Dusty Fingers")).toBeInTheDocument();
      expect(
        screen.getByText(/you dig for the loop before the song/i)
      ).toBeInTheDocument();
      expect(screen.queryByText(/reading your taste/i)).not.toBeInTheDocument();
    });

    it("offers no skip once it has become the reward", () => {
      render(<OnboardingChecklist count={3} reveal={personality} />);

      expect(screen.queryByRole("button", { name: /skip/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });
});
