import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import VideoRecorder from "../../components/UploadModal/VideoRecorder";
import { pickRecordingType, recordingFileName, recordingErrorMessage } from "../../utils/recordingFormat";

// Regression tests for "recording to the feed shows nothing" (2026-10-07):
// the live view and the preview were attached to <video> elements that
// didn't exist yet (blank on every browser), and Safari — every iPhone
// browser — threw on the hard-coded WebM format, reported as "Camera access
// denied".

const stream = { getTracks: () => [{ stop: vi.fn() }] };
let lastRecorder;

// A MediaRecorder that behaves like Chrome (WebM) or Safari (MP4 only).
const installRecorder = ({ supports = (t) => t.startsWith("video/webm"), rejectUnsupported = true } = {}) => {
  class FakeRecorder {
    static isTypeSupported = vi.fn(supports);
    constructor(s, opts = {}) {
      if (opts.mimeType && rejectUnsupported && !supports(opts.mimeType)) {
        throw Object.assign(new Error("unsupported"), { name: "NotSupportedError" });
      }
      this.mimeType = opts.mimeType ?? "video/mp4";
      this.opts = opts;
      lastRecorder = this;
    }
    start = vi.fn();
    stop = vi.fn(() => {
      this.ondataavailable?.({ data: new Blob(["frames"], { type: this.mimeType }) });
      this.onstop?.();
    });
  }
  vi.stubGlobal("MediaRecorder", FakeRecorder);
};

const start = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
  });
};

describe("VideoRecorder", () => {
  beforeEach(() => {
    lastRecorder = null;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    // jsdom has neither; defined directly (not stubbed) so they're still
    // there when the component's cleanup runs after the test.
    URL.createObjectURL = vi.fn(() => "blob:recording");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the camera in the live view while recording (was blank)", async () => {
    installRecorder();
    render(<VideoRecorder timeLimit={60} onRecorded={vi.fn()} />);
    await start();

    expect(screen.getByTestId("recorder-live").srcObject).toBe(stream);
    expect(lastRecorder.start).toHaveBeenCalled();
  });

  it("shows the recording in the preview after Stop (was blank)", async () => {
    installRecorder();
    render(<VideoRecorder timeLimit={60} onRecorded={vi.fn()} />);
    await start();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /stop/i }));
    });

    const preview = screen.getByTestId("recorder-preview");
    expect(preview).toHaveAttribute("src", "blob:recording");
    expect(preview).toHaveAttribute("playsinline");
  });

  it("hands the recording over on 'Use this'", async () => {
    installRecorder();
    const onRecorded = vi.fn();
    render(<VideoRecorder timeLimit={60} onRecorded={onRecorded} />);
    await start();
    act(() => fireEvent.click(screen.getByRole("button", { name: /stop/i })));
    fireEvent.click(screen.getByRole("button", { name: /use this/i }));

    const blob = onRecorded.mock.calls[0][0];
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toMatch(/^video\/webm/);
  });

  it("records MP4 on Safari / iPhone instead of failing on WebM", async () => {
    installRecorder({ supports: (t) => t.startsWith("video/mp4") });
    const onRecorded = vi.fn();
    render(<VideoRecorder timeLimit={60} onRecorded={onRecorded} />);
    await start();

    expect(lastRecorder.opts.mimeType).toMatch(/^video\/mp4/);
    expect(screen.queryByText(/camera access denied/i)).toBeNull();

    act(() => fireEvent.click(screen.getByRole("button", { name: /stop/i })));
    fireEvent.click(screen.getByRole("button", { name: /use this/i }));
    expect(onRecorded.mock.calls[0][0].type).toMatch(/^video\/mp4/);
  });

  it("says access was denied only when it was", async () => {
    installRecorder();
    navigator.mediaDevices.getUserMedia.mockRejectedValue(Object.assign(new Error("no"), { name: "NotAllowedError" }));
    render(<VideoRecorder timeLimit={60} onRecorded={vi.fn()} />);
    await start();

    expect(screen.getByText(/camera access denied/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start recording/i })).toBeInTheDocument();
  });

  it("says the browser can't record (not 'access denied') when the recorder fails, and releases the camera", async () => {
    const stop = vi.fn();
    navigator.mediaDevices.getUserMedia.mockResolvedValue({ getTracks: () => [{ stop }] });
    installRecorder({ supports: () => false }); // nothing supported, and it throws when asked anyway
    vi.stubGlobal(
      "MediaRecorder",
      class {
        static isTypeSupported = () => false;
        constructor() {
          throw Object.assign(new Error("nope"), { name: "NotSupportedError" });
        }
      }
    );
    render(<VideoRecorder timeLimit={60} onRecorded={vi.fn()} />);
    await start();

    expect(screen.getByText(/can't record video here/i)).toBeInTheDocument();
    expect(screen.queryByText(/camera access denied/i)).toBeNull();
    expect(stop).toHaveBeenCalled();
  });

  it("re-record clears the preview and frees its memory", async () => {
    installRecorder();
    render(<VideoRecorder timeLimit={60} onRecorded={vi.fn()} />);
    await start();
    act(() => fireEvent.click(screen.getByRole("button", { name: /stop/i })));
    act(() => fireEvent.click(screen.getByRole("button", { name: /re-record/i })));

    expect(screen.queryByTestId("recorder-preview")).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:recording");
  });
});

describe("recordingFormat", () => {
  it("prefers VP9 WebM, then falls back down to MP4", () => {
    expect(pickRecordingType(() => true)).toBe("video/webm;codecs=vp9,opus");
    expect(pickRecordingType((t) => t.startsWith("video/mp4"))).toBe("video/mp4;codecs=avc1,mp4a");
    expect(pickRecordingType(() => false)).toBe("");
    expect(pickRecordingType(undefined)).toBe("");
  });

  it("names the file by format, since the backend checks the extension", () => {
    expect(recordingFileName("video/mp4;codecs=avc1")).toBe("recording.mp4");
    expect(recordingFileName("video/webm;codecs=vp9")).toBe("recording.webm");
    expect(recordingFileName("")).toBe("recording.webm");
  });

  it("maps each failure to its own message", () => {
    expect(recordingErrorMessage({ name: "NotAllowedError" })).toMatch(/access denied/i);
    expect(recordingErrorMessage({ name: "NotFoundError" })).toMatch(/no camera/i);
    expect(recordingErrorMessage({ name: "NotReadableError" })).toMatch(/another app/i);
    expect(recordingErrorMessage({ name: "NotSupportedError" })).toMatch(/can't record video here/i);
  });
});
