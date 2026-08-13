import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import TasteComps from "../../components/TasteComps/TasteComps";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

import axiosInstance from "../../utils/axiosInstance";

const related = [
  { artist_id: 12, artist_name: "MF DOOM", genre: "Hip Hop", image_url: null },
  { artist_id: 13, artist_name: "Madlib", genre: "Hip Hop", image_url: null },
];

const renderComps = (props = {}) =>
  render(
    <BrowserRouter>
      <TasteComps {...props} />
    </BrowserRouter>
  );

describe("TasteComps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: { related } });
  });

  it("lists the artists people with your taste also stan", async () => {
    renderComps();

    expect(await screen.findByText("MF DOOM")).toBeInTheDocument();
    expect(screen.getByText("Madlib")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /fans of your top 20 also love/i })
    ).toBeInTheDocument();
  });

  it("asks the backend for the whole list in one request", async () => {
    renderComps();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(1));
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/users/me/related-artists?limit=12"
    );
  });

  it("honours a custom limit", async () => {
    renderComps({ limit: 6 });

    await waitFor(() =>
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/users/me/related-artists?limit=6"
      )
    );
  });

  it("opens the artist page when a card is picked", async () => {
    renderComps();
    await screen.findByText("MF DOOM");

    await userEvent.click(screen.getByRole("button", { name: /mf doom/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/artist/12");
  });

  it("fetches nothing until it is unlocked", () => {
    renderComps({ enabled: false });

    expect(axiosInstance.get).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("says nothing at all when there is no signal", async () => {
    axiosInstance.get.mockResolvedValue({ data: { related: [] } });

    const { container } = renderComps();

    // An empty "we found nothing" shell on your own profile is worse than
    // no section, so it renders nothing rather than an empty state.
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("stays silent when the request fails", async () => {
    axiosInstance.get.mockRejectedValue(new Error("boom"));

    const { container } = renderComps();

    // A red banner over a failed recommendation is noise the user can do
    // nothing about — this is a bonus surface, not a core one.
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("shows a loading line while it looks", async () => {
    axiosInstance.get.mockReturnValue(new Promise(() => {}));

    renderComps();

    expect(
      await screen.findByText(/looking for people with your taste/i)
    ).toBeInTheDocument();
  });

  it("tolerates a response with no related key", async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    const { container } = renderComps();

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders an artist that has no genre", async () => {
    axiosInstance.get.mockResolvedValue({
      data: { related: [{ artist_id: 9, artist_name: "Untagged" }] },
    });

    renderComps();

    expect(await screen.findByText("Untagged")).toBeInTheDocument();
  });
});
