import { render } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

/**
 * Custom render function that wraps components with providers
 * Usage: renderWithProviders(<YourComponent />, { preloadedState: {...} })
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({
      reducer: {
        // Add your reducers here
        // Example: user: userReducer,
        // artists: artistsReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Render component with Router only (no Redux)
 */
export function renderWithRouter(ui, { route = "/" } = {}) {
  window.history.pushState({}, "Test page", route);

  return render(ui, { wrapper: BrowserRouter });
}

/**
 * Mock API responses
 */
export const mockApiResponse = {
  artists: [
    {
      artist_id: 1,
      artist_name: "Test Artist",
      aka: "TA",
      genre: "Hip Hop",
      count: 10,
      albums: [],
    },
  ],
  user: {
    user_id: 1,
    username: "testuser",
    email: "test@example.com",
    role: "user",
  },
  posts: [
    {
      post_id: 1,
      user_id: 1,
      content: "Test post",
      created_at: "2024-01-15T10:00:00Z",
    },
  ],
};

/**
 * Mock axios for API calls
 */
export function mockAxios() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => mockAxios()),
  };
}

/**
 * Wait for async operations
 */
export const waitForLoadingToFinish = () => {
  return screen.findByRole("progressbar", {}, { timeout: 3000 }).then(
    () => {},
    () => {} // Ignore if not found
  );
};

/**
 * Create mock user with token
 */
export function createMockUser(overrides = {}) {
  return {
    user_id: 1,
    username: "testuser",
    email: "test@example.com",
    role: "user",
    token: "mock_token_123",
    ...overrides,
  };
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const store = {};

  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";
