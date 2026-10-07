import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import UploadModal from "../../components/UploadModal/UploadModal";
import axiosInstance from "../../utils/axiosInstance";
import { uploadType } from "../../utils/recordingFormat";

// Regression (2026-10-07): recording worked after #187, but posting failed
// with "Video files only". The File was typed "video/webm;codecs=vp9,opus";
// the unquoted comma made the multipart header invalid, the server parsed it
// as text/plain, and the video filter rejected it. These tests walk the
// whole path — record → use → post — and check what's actually sent.

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const fakeRecorder = (reportedType) =>
  class {
    static isTypeSupported = () => true;
    constructor() {
      this.mimeType = reportedType;
    }
    start = vi.fn();
    stop = vi.fn(() => {
      this.ondataavailable?.({ data: new Blob(["frames"], { type: this.mimeType }) });
      this.onstop?.();
    });
  };

const recordAndPost = async () => {
  renderWithProviders(<UploadModal isOpen onClose={vi.fn()} onPostCreated={vi.fn()} />, {
    preloadedState: { auth: { user: { user_id: 1 }, isLoggedIn: true } },
  });
  fireEvent.click(screen.getByRole("button", { name: /video/i }));
  fireEvent.click(screen.getByRole("button", { name: /^record$/i }));
  await act(async () => fireEvent.click(screen.getByRole("button", { name: /start recording/i })));
  act(() => fireEvent.click(screen.getByRole("button", { name: /stop/i })));
  fireEvent.click(screen.getByRole("button", { name: /use this/i }));
  fireEvent.click(screen.getByRole("button", { name: /next/i }));
  await act(async () => fireEvent.click(screen.getByRole("button", { name: /^post$/i })));
  const call = axiosInstance.post.mock.calls.find(([url]) => url === "/feed/video");
  return call?.[1]?.get("video");
};

describe("UploadModal — posting a recording", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.post.mockResolvedValue({ data: {} });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    });
    URL.createObjectURL = vi.fn(() => "blob:recording");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("uploads a Chrome recording as plain video/webm, named .webm (was video/webm;codecs=vp9,opus)", async () => {
    vi.stubGlobal("MediaRecorder", fakeRecorder("video/webm;codecs=vp9,opus"));
    const file = await recordAndPost();
    expect(file).toBeTruthy();
    expect(file.type).toBe("video/webm");
    expect(file.name).toBe("recording.webm");
  });

  it("uploads a Safari / iPhone recording as plain video/mp4, named .mp4", async () => {
    vi.stubGlobal("MediaRecorder", fakeRecorder("video/mp4;codecs=avc1,mp4a"));
    const file = await recordAndPost();
    expect(file.type).toBe("video/mp4");
    expect(file.name).toBe("recording.mp4");
  });
});

describe("uploadType", () => {
  it.each([
    ["video/webm;codecs=vp9,opus", "video/webm"],
    ["video/mp4;codecs=avc1,mp4a", "video/mp4"],
    ["video/mp4", "video/mp4"],
    ["VIDEO/WEBM; codecs=vp8", "video/webm"],
    ["", "video/webm"],
    [undefined, "video/webm"],
  ])("%s → %s", (input, out) => {
    expect(uploadType(input)).toBe(out);
  });
});
