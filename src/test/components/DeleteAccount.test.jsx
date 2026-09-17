import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import DeleteAccount from "../../components/DeleteAccount/DeleteAccount";

const navigateSpy = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateSpy };
});

vi.mock("../../utils/axiosInstance", () => ({
  default: { delete: vi.fn() },
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const logoutSpy = vi.fn();
vi.mock("../../store/authSlice", () => ({
  logout: () => {
    logoutSpy();
    return { type: "auth/logout" };
  },
}));

import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const renderIt = (username = "andrew3") =>
  render(
    <Provider store={configureStore({ reducer: { auth: (s = {}) => s } })}>
      <MemoryRouter>
        <DeleteAccount username={username} />
      </MemoryRouter>
    </Provider>
  );

const open = async (user) => {
  await user.click(screen.getByRole("button", { name: /^delete account$/i }));
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  axiosInstance.delete.mockResolvedValue({ data: { message: "Account deleted." } });
});

describe("DeleteAccount — the gate", () => {
  it("does not delete on one tap", async () => {
    // The requirement is that deletion be available, not frictionless, and
    // this cannot be undone.
    const user = userEvent.setup({ delay: null });
    renderIt();

    await open(user);

    expect(axiosInstance.delete).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /delete my account/i })).toBeDisabled();
  });

  it("stays disabled until the username matches exactly", async () => {
    const user = userEvent.setup({ delay: null });
    renderIt("andrew3");
    await open(user);

    await user.type(screen.getByLabelText(/type your username/i), "andrew");
    expect(screen.getByRole("button", { name: /delete my account/i })).toBeDisabled();

    await user.type(screen.getByLabelText(/type your username/i), "3");
    expect(screen.getByRole("button", { name: /delete my account/i })).toBeEnabled();
  });

  it("is case sensitive", async () => {
    // "Andrew3" is a different string, and a near-miss should not pass a
    // confirmation whose whole job is deliberateness.
    const user = userEvent.setup({ delay: null });
    renderIt("andrew3");
    await open(user);

    await user.type(screen.getByLabelText(/type your username/i), "Andrew3");

    expect(screen.getByRole("button", { name: /delete my account/i })).toBeDisabled();
  });

  it("can be backed out of", async () => {
    const user = userEvent.setup({ delay: null });
    renderIt();
    await open(user);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByRole("button", { name: /^delete account$/i })).toBeInTheDocument();
    expect(axiosInstance.delete).not.toHaveBeenCalled();
  });
});

describe("DeleteAccount — what it tells the user", () => {
  it("names what is removed", async () => {
    const user = userEvent.setup({ delay: null });
    renderIt();
    await open(user);

    expect(screen.getByText(/email, username and profile picture/i)).toBeInTheDocument();
    expect(screen.getByText(/top 20 and your music personality/i)).toBeInTheDocument();
  });

  it("names what survives, rather than implying everything goes", async () => {
    // Posts are parked, crates stay live, purchases are kept. Saying "this
    // deletes everything" would be a lie the user only discovers afterwards.
    const user = userEvent.setup({ delay: null });
    renderIt();
    await open(user);

    expect(screen.getByText(/posts and messages you wrote/i)).toBeInTheDocument();
    expect(screen.getByText(/crates you shared/i)).toBeInTheDocument();
    expect(screen.getByText(/quarterly picks and purchase records/i)).toBeInTheDocument();
  });

  it("says it cannot be undone", async () => {
    const user = userEvent.setup({ delay: null });
    renderIt();
    await open(user);

    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });
});

describe("DeleteAccount — deleting", () => {
  const confirmAndDelete = async (user, username = "andrew3") => {
    await open(user);
    await user.type(screen.getByLabelText(/type your username/i), username);
    await user.click(screen.getByRole("button", { name: /delete my account/i }));
  };

  it("calls the endpoint", async () => {
    const user = userEvent.setup({ delay: null });
    renderIt();

    await confirmAndDelete(user);

    await waitFor(() => expect(axiosInstance.delete).toHaveBeenCalledWith("/users/me"));
  });

  it("clears the session before leaving", async () => {
    // A token for an account that no longer resolves puts the app in a state
    // where every request fails with no explanation.
    const user = userEvent.setup({ delay: null });
    localStorage.setItem("token", "stale");
    renderIt();

    await confirmAndDelete(user);

    await waitFor(() => expect(logoutSpy).toHaveBeenCalled());
    expect(localStorage.getItem("token")).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("keeps the user signed in when deletion fails", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.delete.mockRejectedValue({
      response: { data: { message: "Could not delete your account." } },
    });
    localStorage.setItem("token", "still-valid");
    renderIt();

    await confirmAndDelete(user);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Could not delete your account.")
    );
    // Signing somebody out of an account that still exists would be worse
    // than the failure itself.
    expect(logoutSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBe("still-valid");
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("stays usable after a failure so it can be retried", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.delete.mockRejectedValue({ response: { data: {} } });
    renderIt();

    await confirmAndDelete(user);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /delete my account/i })).toBeEnabled()
    );
  });
});
