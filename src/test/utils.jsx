import { render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

import artistsReducer from "../redux/reducers/artistsReducer";
import authReducer from "../store/authSlice";
import profileListReducer from "../redux/profileListSlice";
import messagesReducer from "../redux/messagesSlice";
import playerReducer from "../redux/playerSlice";

// Sane default state for every slice in the prod store. Tests can
// override any slice via `preloadedState`. Keep this in sync with
// each slice's `initialState` — when a new slice is added to the
// real store, also add it here.
export const buildMockState = (overrides = {}) => ({
  auth: {
    user: null,
    isLoggedIn: false,
    loading: false,
    error: null,
    claimRequests: [],
    ...(overrides.auth || {}),
  },
  artists: {
    artists: [],
    loading: false,
    error: null,
    ...(overrides.artists || {}),
  },
  profileList: {
    list: [],
    loading: false,
    error: null,
    ...(overrides.profileList || {}),
  },
  messages: {
    conversations: [],
    activeConversation: null,
    loading: false,
    error: null,
    ...(overrides.messages || {}),
  },
  player: {
    queue: [],
    currentIndex: 0,
    isPlaying: false,
    ...(overrides.player || {}),
  },
});

/**
 * Build a configured store with every slice the real app uses.
 * Exported so tests can dispatch into it directly when needed.
 */
export const buildMockStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      artists: artistsReducer,
      profileList: profileListReducer,
      messages: messagesReducer,
      player: playerReducer,
    },
    preloadedState: buildMockState(preloadedState),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

/**
 * Custom render that wraps children in <Provider> + <BrowserRouter>.
 * Pass `preloadedState` to override any slice's initial state.
 */
export function renderWithProviders(
  ui,
  { preloadedState = {}, store = buildMockStore(preloadedState), ...renderOptions } = {},
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
 * Render with Router only (no Redux).
 */
export function renderWithRouter(ui, { route = "/" } = {}) {
  window.history.pushState({}, "Test page", route);
  return render(ui, { wrapper: BrowserRouter });
}

/** Common mock API payloads tests pull from. */
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

export function mockAxios() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => mockAxios()),
  };
}

export const waitForLoadingToFinish = () =>
  screen.findByRole("progressbar", {}, { timeout: 3000 }).then(
    () => {},
    () => {},
  );

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

export * from "@testing-library/react";
