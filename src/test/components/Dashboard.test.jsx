import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Dashboard from "../../components/Dashboard/Dashboard";

// Mock CSS modules
vi.mock("../../components/Dashboard/Dashboard.module.css", () => ({
  default: {
    dashboardContainer: "dashboardContainer",
  },
}));

// Mock Feed component
vi.mock("../../components/Feed/Feed", () => ({
  default: () => <div data-testid="feed-component">Feed Component</div>,
}));

const createMockStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: () => ({
        user: null,
        token: null,
        ...authState,
      }),
    },
  });
};

const renderDashboard = (authState = {}) => {
  const store = createMockStore(authState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </Provider>
  );
};

describe("Dashboard Component", () => {
  describe("Rendering", () => {
    it("renders without crashing", () => {
      renderDashboard();
      expect(screen.getByTestId("feed-component")).toBeInTheDocument();
    });

    it("renders the Feed component", () => {
      renderDashboard();
      expect(screen.getByText("Feed Component")).toBeInTheDocument();
    });
  });

  describe("Redux Integration", () => {
    it("has access to user from Redux store", () => {
      renderDashboard({
        user: { id: 1, username: "testuser", role: "user" },
        token: "mock-token",
      });

      expect(screen.getByTestId("feed-component")).toBeInTheDocument();
    });
  });
});
