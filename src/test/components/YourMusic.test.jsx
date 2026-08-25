import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import YourMusic from "../../components/YourMusic/YourMusic";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn() },
}));

// The widget loads a third-party script; irrelevant to the create form.
vi.mock("../../utils/cloudinaryUploadWidget", () => ({
  loadCloudinaryWidgetScript: vi.fn().mockResolvedValue(undefined),
  STANBOX_WIDGET_PALETTE: {},
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

// Real users pick a date rather than typing one, and per-keystroke typing of
// "2026-08-14" was slow enough to blow the 5s timeout when the full suite runs
// in parallel. fireEvent matches what a date picker actually emits.
const setDate = (value) =>
  fireEvent.change(screen.getByLabelText(/release date/i), { target: { value } });

const openCreateForm = async (user) => {
  await user.click(await screen.findByRole("button", { name: /add new release/i }));
};

const fillName = async (user, name = "Playing With Fire") => {
  // Label text is release-type driven ("Album name *"), default is album.
  const nameField = screen.getByLabelText(/album name/i);
  await user.clear(nameField);
  await user.type(nameField, name);
};

describe("YourMusic — release date", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: { albums: [] } });
    axiosInstance.post.mockResolvedValue({ data: { album: null } });
  });

  it("sends the release date with a new album", async () => {
    // Without this, an album an artist adds carries a bare year and is
    // invisible to quarterly picks and every other time-boxed surface.
    const user = userEvent.setup({ delay: null });
    render(<YourMusic />);
    await openCreateForm(user);
    await fillName(user);

    setDate("2026-08-14");
    await user.click(screen.getByRole("button", { name: /^create /i }));

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalled());
    const [url, body] = axiosInstance.post.mock.calls[0];
    expect(url).toBe("/artists/me/albums");
    expect(body.release_date).toBe("2026-08-14");
  });

  it("pulls the year from the date so the two can't disagree", async () => {
    const user = userEvent.setup({ delay: null });
    render(<YourMusic />);
    await openCreateForm(user);
    await fillName(user);

    setDate("2019-03-01");
    await user.click(screen.getByRole("button", { name: /^create /i }));

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalled());
    expect(axiosInstance.post.mock.calls[0][1].year).toBe(2019);
  });

  it("still submits when no date is given", async () => {
    // Optional on purpose — back-catalogue releases may have no known day.
    const user = userEvent.setup({ delay: null });
    render(<YourMusic />);
    await openCreateForm(user);
    await fillName(user);

    await user.click(screen.getByRole("button", { name: /^create /i }));

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalled());
    expect(axiosInstance.post.mock.calls[0][1].release_date).toBeNull();
  });

  it("blocks a date that contradicts a hand-edited year", async () => {
    const user = userEvent.setup({ delay: null });
    render(<YourMusic />);
    await openCreateForm(user);
    await fillName(user);

    setDate("2026-08-14");
    const yearField = screen.getByLabelText(/^year/i);
    await user.clear(yearField);
    await user.type(yearField, "2024");

    await user.click(screen.getByRole("button", { name: /^create /i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringMatching(/release date must fall in the year/i)
      )
    );
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });
});
