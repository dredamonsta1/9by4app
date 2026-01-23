import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import MainList from "../../components/MainList/MainList";

// Mock CSS module
vi.mock("../../components/MainList/MainList.module.css", () => ({
  default: {},
}));

// Mock RapperList component
vi.mock("../../components/RapperList", () => ({
  default: ({ showAdminActions, showCloutButton }) => (
    <div data-testid="rapper-list">
      <span data-testid="admin-actions">{showAdminActions ? "true" : "false"}</span>
      <span data-testid="clout-button">{showCloutButton ? "true" : "false"}</span>
    </div>
  ),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: () => ({ user: null, token: null }),
      artists: () => ({ artists: [], loading: false }),
    },
  });
};

const renderMainList = () => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <MainList />
      </BrowserRouter>
    </Provider>
  );
};

describe("MainList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the main heading", () => {
      renderMainList();

      expect(screen.getByText(/welcome to the main list/i)).toBeInTheDocument();
    });

    it("renders the description text", () => {
      renderMainList();

      expect(screen.getByText(/explore our collection of rappers/i)).toBeInTheDocument();
    });

    it("renders the dashboard button", () => {
      renderMainList();

      expect(screen.getByRole("button", { name: /go to dashboard/i })).toBeInTheDocument();
    });

    it("renders the RapperList component", () => {
      renderMainList();

      expect(screen.getByTestId("rapper-list")).toBeInTheDocument();
    });
  });

  describe("RapperList Props", () => {
    it("passes showAdminActions as false", () => {
      renderMainList();

      expect(screen.getByTestId("admin-actions")).toHaveTextContent("false");
    });

    it("passes showCloutButton as false", () => {
      renderMainList();

      expect(screen.getByTestId("clout-button")).toHaveTextContent("false");
    });
  });

  describe("Navigation", () => {
    it("navigates to dashboard when button clicked", async () => {
      const user = userEvent.setup();
      renderMainList();

      await user.click(screen.getByRole("button", { name: /go to dashboard/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Button Styling", () => {
    it("has correct button styles", () => {
      renderMainList();

      const button = screen.getByRole("button", { name: /go to dashboard/i });
      expect(button).toHaveStyle({ backgroundColor: "#28a745" });
    });
  });
});
