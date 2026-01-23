import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import ProtectedRoute from "../../components/ProtectedRoute/ProtectedRoute";

// Mock the selectIsLoggedIn selector
vi.mock("../../store/authSlice", () => ({
  selectIsLoggedIn: (state) => state.auth.isLoggedIn,
}));

const createMockStore = (isLoggedIn = false) => {
  return configureStore({
    reducer: {
      auth: () => ({ isLoggedIn }),
    },
  });
};

const renderWithProviders = (store) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("ProtectedRoute Component", () => {
  describe("When user is not logged in", () => {
    it("redirects to login page", () => {
      const store = createMockStore(false);
      renderWithProviders(store);

      expect(screen.getByText("Login Page")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("When user is logged in", () => {
    it("renders the protected content", () => {
      const store = createMockStore(true);
      renderWithProviders(store);

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
      expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });
  });
});
