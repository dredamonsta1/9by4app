import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import FeedComposerBar from "../../components/FeedComposerBar/FeedComposerBar";

const andrew = { id: 1, username: "andrew3", profile_image: "https://res.cloudinary.com/x/andrew.jpg" };

describe("FeedComposerBar", () => {
  it("shows your photo beside the prompt, linking to your profile", () => {
    const { container } = renderWithProviders(<FeedComposerBar user={andrew} onCompose={() => {}} />);

    expect(container.querySelector("img")).toHaveAttribute("src", andrew.profile_image);
    expect(screen.getByRole("link", { name: "Your profile" })).toHaveAttribute("href", "/profile");
  });

  it("opens the composer from the prompt", () => {
    const onCompose = vi.fn();
    renderWithProviders(<FeedComposerBar user={andrew} onCompose={onCompose} />);

    fireEvent.click(screen.getByRole("button", { name: /what.s on your mind/i }));
    expect(onCompose).toHaveBeenCalledTimes(1);
  });

  it("falls back to your initial when you have no photo", () => {
    const { container } = renderWithProviders(
      <FeedComposerBar user={{ ...andrew, profile_image: null }} onCompose={() => {}} />
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("falls back to your initial when the photo fails to load", () => {
    const { container } = renderWithProviders(<FeedComposerBar user={andrew} onCompose={() => {}} />);

    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders nothing for a guest", () => {
    const { container } = renderWithProviders(<FeedComposerBar user={null} onCompose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
