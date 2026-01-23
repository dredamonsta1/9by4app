import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import ProtectedAdminRoute from "../../components/ProtectedAdminRoute/ProtectedAdminRoute";

const createMockStore = (authState = {}) => {
  const defaultState = {
    user: null,
    token: null,
    status: "idle",
    ...authState,
  };

  return configureStore({
    reducer: {
      auth: () => defaultState,
    },
  });
};

const renderWithProviders = (store, children = <div>Admin Content</div>) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/admin"
            element={<ProtectedAdminRoute>{children}</ProtectedAdminRoute>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("ProtectedAdminRoute Component", () => {
  describe("When user is admin", () => {
    it("renders children for admin users", () => {
      const store = createMockStore({
        user: { id: 1, username: "admin", role: "admin" },
        token: "valid-token",
        status: "succeeded",
      });

      renderWithProviders(store);

      expect(screen.getByText("Admin Content")).toBeInTheDocument();
    });

    it("handles case-insensitive role check", () => {
      const store = createMockStore({
        user: { id: 1, username: "admin", role: "ADMIN" },
        token: "valid-token",
        status: "succeeded",
      });

      renderWithProviders(store);

      expect(screen.getByText("Admin Content")).toBeInTheDocument();
    });
  });

  describe("When user is not admin", () => {
    it("redirects non-admin users to login", () => {
      const store = createMockStore({
        user: { id: 1, username: "user", role: "user" },
        token: "valid-token",
        status: "succeeded",
      });

      renderWithProviders(store);

      expect(screen.getByText("Login Page")).toBeInTheDocument();
      expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
    });

    it("redirects when no user is present", () => {
      const store = createMockStore({
        user: null,
        token: null,
        status: "idle",
      });

      renderWithProviders(store);

      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("redirects when only token exists but no user", () => {
      const store = createMockStore({
        user: null,
        token: "some-token",
        status: "idle",
      });

      renderWithProviders(store);

      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading message when verifying with token but no user", () => {
      const store = createMockStore({
        user: null,
        token: "valid-token",
        status: "loading",
      });

      renderWithProviders(store);

      expect(screen.getByText("Verifying Admin Credentials...")).toBeInTheDocument();
    });

    it("does not show loading when user data is already present", () => {
      const store = createMockStore({
        user: { id: 1, username: "admin", role: "admin" },
        token: "valid-token",
        status: "loading",
      });

      renderWithProviders(store);

      expect(screen.getByText("Admin Content")).toBeInTheDocument();
      expect(screen.queryByText("Verifying Admin Credentials...")).not.toBeInTheDocument();
    });
  });
});
