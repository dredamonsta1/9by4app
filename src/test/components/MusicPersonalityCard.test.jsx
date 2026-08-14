import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MusicPersonalityCard from "../../components/MusicPersonalityCard/MusicPersonalityCard";

const personality = {
  title: "Dusty Fingers",
  description: "You dig for the loop before the song.",
};

describe("MusicPersonalityCard", () => {
  describe("with a personality", () => {
    it("shows the title and description", () => {
      render(<MusicPersonalityCard personality={personality} />);

      expect(screen.getByText("Dusty Fingers")).toBeInTheDocument();
      expect(
        screen.getByText(/you dig for the loop before the song/i)
      ).toBeInTheDocument();
    });

    it("carries the controls that used to live in a separate section", () => {
      render(<MusicPersonalityCard personality={personality} />);

      expect(
        screen.getByRole("button", { name: /regenerate/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { name: /show on my public profile/i })
      ).toBeInTheDocument();
    });

    it("regenerates on request", async () => {
      const onAnalyze = vi.fn();
      render(
        <MusicPersonalityCard personality={personality} onAnalyze={onAnalyze} />
      );

      await userEvent.click(screen.getByRole("button", { name: /regenerate/i }));

      expect(onAnalyze).toHaveBeenCalled();
    });

    it("reports a visibility change", async () => {
      const onVisibilityChange = vi.fn();
      render(
        <MusicPersonalityCard
          personality={personality}
          isPublic={false}
          onVisibilityChange={onVisibilityChange}
        />
      );

      await userEvent.click(screen.getByRole("checkbox"));

      expect(onVisibilityChange).toHaveBeenCalledWith(true);
    });

    it("flags a private personality", () => {
      render(<MusicPersonalityCard personality={personality} isPublic={false} />);

      expect(screen.getByText(/^private$/i)).toBeInTheDocument();
    });

    it("drops the private flag once it's public", () => {
      render(<MusicPersonalityCard personality={personality} isPublic />);

      expect(screen.queryByText(/^private$/i)).not.toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("renders the same content whether or not it's celebrating", () => {
      const { rerender } = render(
        <MusicPersonalityCard personality={personality} celebratory />
      );
      expect(screen.getByText("Dusty Fingers")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /regenerate/i })).toBeInTheDocument();

      // celebratory is styling only — it must not gate the controls, or the
      // toggle would vanish on the next page load.
      rerender(<MusicPersonalityCard personality={personality} />);
      expect(screen.getByText("Dusty Fingers")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /regenerate/i })).toBeInTheDocument();
    });
  });

  describe("without one", () => {
    it("offers a manual trigger when eligible but empty", () => {
      // Reachable by skipping onboarding, or by an auto-generate that
      // failed. Deleting the old section would otherwise have removed the
      // only way to trigger it.
      render(<MusicPersonalityCard personality={null} eligible />);

      expect(
        screen.getByRole("button", { name: /analyze my taste/i })
      ).toBeInTheDocument();
    });

    it("stays out of the way below the artist threshold", () => {
      const { container } = render(
        <MusicPersonalityCard personality={null} eligible={false} />
      );

      // The onboarding checklist owns this slot until the threshold is met.
      expect(container).toBeEmptyDOMElement();
    });

    it("says nothing below the threshold even with a personality", () => {
      const { container } = render(
        <MusicPersonalityCard personality={personality} eligible={false} />
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("on someone else's profile", () => {
    it("shows their personality with no controls", () => {
      render(
        <MusicPersonalityCard readOnly ownerName="marcus" personality={personality} />
      );

      expect(screen.getByText("Dusty Fingers")).toBeInTheDocument();
      expect(screen.getByText(/marcus's music personality/i)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /regenerate/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("never leaks the private badge onto a public view", () => {
      // A visitor only ever receives a personality the owner made public,
      // so labelling it "Private" would be actively wrong.
      render(
        <MusicPersonalityCard
          readOnly
          ownerName="marcus"
          personality={personality}
          isPublic={false}
        />
      );

      expect(screen.queryByText(/^private$/i)).not.toBeInTheDocument();
    });

    it("renders nothing when they have none, or keep it private", () => {
      // The backend omits the fields entirely unless they're public, so the
      // two cases are indistinguishable here — and should look identical.
      const { container } = render(
        <MusicPersonalityCard readOnly ownerName="marcus" personality={null} />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("ignores eligibility, which isn't ours to reason about", () => {
      render(
        <MusicPersonalityCard
          readOnly
          ownerName="marcus"
          personality={personality}
          eligible={false}
        />
      );

      expect(screen.getByText("Dusty Fingers")).toBeInTheDocument();
    });

    it("falls back to a generic label with no name", () => {
      render(<MusicPersonalityCard readOnly personality={personality} />);

      expect(screen.getByText(/^music personality$/i)).toBeInTheDocument();
    });
  });

  describe("loading", () => {
    it("shows progress while the analysis runs", () => {
      render(<MusicPersonalityCard personality={null} loading eligible />);

      expect(screen.getByText(/reading your taste/i)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /analyze my taste/i })
      ).not.toBeInTheDocument();
    });

    it("keeps showing progress over a stale personality", () => {
      render(<MusicPersonalityCard personality={personality} loading eligible />);

      expect(screen.getByText(/reading your taste/i)).toBeInTheDocument();
      expect(screen.queryByText("Dusty Fingers")).not.toBeInTheDocument();
    });
  });
});
