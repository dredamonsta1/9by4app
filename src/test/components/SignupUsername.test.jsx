import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Signup from "../../components/Signup/Signup";
import { validateUsername } from "../../utils/username";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import axiosInstance from "../../utils/axiosInstance";

// Signup only dispatches (setCredentials, redeemPendingStan) on a successful
// verify, which none of these reach — so a bare store is enough.
const renderSignup = () =>
  render(
    <Provider store={configureStore({ reducer: { auth: (s = {}) => s } })}>
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    </Provider>
  );

const fill = async (user, { email = "a@b.co", username = "andre", code = "INV1" } = {}) => {
  await user.type(screen.getByPlaceholderText(/email/i), email);
  if (username) await user.type(screen.getByPlaceholderText("username"), username);
  const invite = screen.getByPlaceholderText("ENTER-CODE");
  await user.clear(invite);
  await user.type(invite, code);
};

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.get.mockResolvedValue({ data: { suggestions: [] } });
  axiosInstance.post.mockResolvedValue({ data: {} });
});

describe("validateUsername (mirrors the API)", () => {
  it.each(["andre", "Lil_Cowbell", "MC-Kazoo", "a1b"])("accepts %s", (n) => {
    expect(validateUsername(n)).toBeNull();
  });

  it.each([
    ["ab", /at least 3/i],
    ["a".repeat(21), /20 characters or fewer/i],
    ["has space", /letters, numbers/i],
    ["-leading", /letters, numbers/i],
    ["admin", /reserved/i],
    ["ADMIN", /reserved/i],
  ])("rejects %s", (n, expected) => {
    expect(validateUsername(n)).toMatch(expected);
  });
});

describe("Signup — username checked before the code is sent", () => {
  it("refuses to send a code for a reserved name", async () => {
    // The whole point: server-side this fires only after code verification,
    // so the user would wait for an email and enter six digits to find out.
    const user = userEvent.setup({ delay: null });
    renderSignup();
    await fill(user, { username: "admin" });

    await user.click(screen.getByRole("button", { name: /send|code|register/i }));

    expect(await screen.findByText(/reserved/i)).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("refuses a name that is too short", async () => {
    const user = userEvent.setup({ delay: null });
    renderSignup();
    await fill(user, { username: "ab" });

    await user.click(screen.getByRole("button", { name: /send|code|register/i }));

    expect(await screen.findByText(/at least 3/i)).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("sends the code for a valid name", async () => {
    const user = userEvent.setup({ delay: null });
    renderSignup();
    await fill(user, { username: "LilCowbell" });

    await user.click(screen.getByRole("button", { name: /send|code|register/i }));

    await waitFor(() =>
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/send-code",
        expect.anything()
      )
    );
  });
});

describe("Signup — suggestions", () => {
  it("offers names fetched from the API", async () => {
    axiosInstance.get.mockResolvedValue({
      data: { suggestions: ["LilCowbell", "DJTinnitus"] },
    });
    renderSignup();

    expect(await screen.findByRole("button", { name: "LilCowbell" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "DJTinnitus" })).toBeInTheDocument();
  });

  it("fills the field when one is picked", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.get.mockResolvedValue({ data: { suggestions: ["LilCowbell"] } });
    renderSignup();

    await user.click(await screen.findByRole("button", { name: "LilCowbell" }));

    expect(screen.getByPlaceholderText("username")).toHaveValue("LilCowbell");
  });

  it("clears a stale error when a suggestion replaces the bad name", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.get.mockResolvedValue({ data: { suggestions: ["LilCowbell"] } });
    renderSignup();
    await fill(user, { username: "admin" });
    await user.click(screen.getByRole("button", { name: /send|code|register/i }));
    await screen.findByText(/reserved/i);

    await user.click(screen.getByRole("button", { name: "LilCowbell" }));

    // Leaving it up would have the form complaining about a name that is no
    // longer in the field.
    expect(screen.queryByText(/reserved/i)).not.toBeInTheDocument();
  });

  it("renders nothing when the API returns none", async () => {
    axiosInstance.get.mockResolvedValue({ data: { suggestions: [] } });
    renderSignup();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    expect(screen.queryByText(/need one/i)).not.toBeInTheDocument();
  });

  it("survives the suggestions request failing", async () => {
    // A nicety must never block signup.
    axiosInstance.get.mockRejectedValue(new Error("down"));
    renderSignup();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    expect(screen.getByPlaceholderText("username")).toBeInTheDocument();
  });
});
