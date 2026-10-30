import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import {
  getConnectionToken,
  getSubscriptionToken,
  getSharedCentrifuge,
  prepareChannelSubscription,
  releaseChannelSubscription,
  resetSharedCentrifuge,
} from "./shared-centrifuge.ts";

test("SSR guard: returns empty string when window is undefined", async () => {
  const originalWindow = globalThis.window;
  try {
    delete globalThis.window;
    const connToken = await getConnectionToken();
    assert.equal(connToken, "");

    const subToken = await getSubscriptionToken("test-channel");
    assert.equal(subToken, "");
  } finally {
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow;
    }
  }
});

test("returns empty string when token is not found in localStorage", async () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;

  try {
    globalThis.window = {};
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };

    const connToken = await getConnectionToken();
    assert.equal(connToken, "");

    const subToken = await getSubscriptionToken("test-channel");
    assert.equal(subToken, "");
  } finally {
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow;
    } else {
      delete globalThis.window;
    }
    if (originalLocalStorage !== undefined) {
      globalThis.localStorage = originalLocalStorage;
    } else {
      delete globalThis.localStorage;
    }
  }
});

test("returns token when axios request succeeds", async () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;
  const originalGet = axios.get;
  const originalPost = axios.post;

  try {
    globalThis.window = {};
    globalThis.localStorage = {
      getItem: (key) => (key === "token" ? "auth-jwt-token" : null),
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 1,
    };

    axios.get = async () => ({
      data: { data: { token: "centrifugo-conn-token" } },
    });
    axios.post = async () => ({
      data: { data: { token: "centrifugo-sub-token" } },
    });

    const connToken = await getConnectionToken();
    assert.equal(connToken, "centrifugo-conn-token");

    const subToken = await getSubscriptionToken("test-channel");
    assert.equal(subToken, "centrifugo-sub-token");
  } finally {
    axios.get = originalGet;
    axios.post = originalPost;
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow;
    } else {
      delete globalThis.window;
    }
    if (originalLocalStorage !== undefined) {
      globalThis.localStorage = originalLocalStorage;
    } else {
      delete globalThis.localStorage;
    }
  }
});

test("handles network/401 failure gracefully and returns empty string without unhandled rejection", async () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;
  const originalGet = axios.get;
  const originalPost = axios.post;
  const originalConsoleError = console.error;

  try {
    console.error = () => {}; // suppress expected test log
    globalThis.window = {};
    globalThis.localStorage = {
      getItem: (key) => (key === "token" ? "expired-token" : null),
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 1,
    };

    axios.get = async () => {
      const error = new Error("Request failed with status code 401");
      error.response = { status: 401 };
      throw error;
    };
    axios.post = async () => {
      throw new Error("Network Error");
    };

    const connToken = await getConnectionToken();
    assert.equal(connToken, "");

    const subToken = await getSubscriptionToken("test-channel");
    assert.equal(subToken, "");
  } finally {
    console.error = originalConsoleError;
    axios.get = originalGet;
    axios.post = originalPost;
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow;
    } else {
      delete globalThis.window;
    }
    if (originalLocalStorage !== undefined) {
      globalThis.localStorage = originalLocalStorage;
    } else {
      delete globalThis.localStorage;
    }
  }
});

test("manages subscription reference counting correctly", () => {
  let unsubscribed = false;
  let removed = false;
  const mockSub = {
    unsubscribe: () => {
      unsubscribed = true;
    },
  };
  let currentSub = null;
  const mockClient = {
    getSubscription: () => currentSub,
    newSubscription: () => {
      currentSub = mockSub;
      return mockSub;
    },
    removeSubscription: () => {
      removed = true;
      currentSub = null;
    },
  };

  const sub1 = prepareChannelSubscription(mockClient, "test-ch", {});
  assert.equal(sub1, mockSub);

  const sub2 = prepareChannelSubscription(mockClient, "test-ch", {});
  assert.equal(sub2, mockSub);

  // First release: ref count decrements to 1, should not unsubscribe yet
  releaseChannelSubscription(mockClient, "test-ch", sub1);
  assert.equal(unsubscribed, false);
  assert.equal(removed, false);

  // Second release: ref count reaches 0, unsubscribes and removes
  releaseChannelSubscription(mockClient, "test-ch", sub2);
  assert.equal(unsubscribed, true);
  assert.equal(removed, true);
});
