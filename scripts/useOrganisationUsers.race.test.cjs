const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Run the real hook with deterministic React hooks and controllable API promises.
// The repo has no unit-test runner; run with: node --test scripts/useOrganisationUsers.race.test.cjs
function createHarness() {
  const slots = [];
  const requests = [];
  const effects = [];
  const browseUsers = [{ id: "browse", name: "Browse member" }];
  const context = {
    state: { orgMembers: browseUsers, orgCallback: 0 },
    dispatch() {},
  };
  let cursor = 0;
  let dirty = false;
  let props;
  let result;

  const nextSlot = (initial) => {
    const index = cursor++;
    if (!(index in slots)) slots[index] = initial;
    return index;
  };
  const changed = (before, after) =>
    !before || after.some((value, index) => !Object.is(value, before[index]));

  const react = {
    useState(initial) {
      const index = nextSlot(initial);
      return [
        slots[index],
        (value) => {
          slots[index] =
            typeof value === "function" ? value(slots[index]) : value;
          dirty = true;
        },
      ];
    },
    useRef(initial) {
      return slots[nextSlot({ current: initial })];
    },
    useContext() {
      return context;
    },
    useCallback(callback, dependencies) {
      const index = nextSlot({ dependencies, callback });
      if (changed(slots[index].dependencies, dependencies)) {
        slots[index] = { dependencies, callback };
      }
      return slots[index].callback;
    },
    useEffect(effect, dependencies) {
      const index = nextSlot(null);
      if (changed(slots[index], dependencies)) {
        slots[index] = dependencies;
        effects.push(effect);
      }
    },
  };

  const source = fs.readFileSync(
    path.join(__dirname, "../src/hooks/useOrganisationUsers.ts"),
    "utf8"
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module,
    exports: module.exports,
    URLSearchParams,
    require(name) {
      if (name === "react") return react;
      if (name === "use-debounce")
        return { useDebounce: () => [props.debounced] };
      if (name === "~/store/GlobalState") return { DataContext: {} };
      if (name === "~/store/Actions")
        return { ACTIONS: { ORG_MEMBERS: "members" } };
      if (name === "~/utils/new-request") {
        return {
          GetRequest(url) {
            if (!url.includes("search=")) {
              return Promise.resolve({
                status: 200,
                data: { data: browseUsers, pagination: { total_pages: 1 } },
              });
            }
            return new Promise((resolve) => requests.push({ url, resolve }));
          },
        };
      }
      throw new Error(`Unexpected import: ${name}`);
    },
  });

  function render(search, debounced = search, orgId = "org-a") {
    props = { search, debounced, orgId };
    for (let pass = 0; pass < 20; pass++) {
      cursor = 0;
      dirty = false;
      result = module.exports.useOrganisationUsers(orgId, { search });
      effects.splice(0).forEach((effect) => effect());
      if (!dirty) return result;
    }
    throw new Error("Hook did not settle");
  }

  async function respond(query, users, pagination = { total_pages: 1 }) {
    const request = requests.find(
      (item) =>
        !item.done &&
        new URL(item.url, "https://test.invalid").searchParams.get("search") ===
          query
    );
    assert.ok(request, `Expected pending request for ${query}`);
    request.done = true;
    request.resolve({ status: 200, data: { data: users, pagination } });
    await new Promise(setImmediate);
    return render(props.search, props.debounced, props.orgId);
  }

  return { render, respond, requests };
}

test("late response from previous query cannot replace newer results", async () => {
  const hook = createHarness();
  hook.render("Alice");
  hook.render("Bob", "Alice");
  hook.render("Bob");

  let state = await hook.respond("Bob", [{ id: "bob", name: "Bob" }]);
  assert.equal(state.users[0].name, "Bob");
  assert.equal(state.loading, false);

  state = await hook.respond("Alice", [{ id: "alice", name: "Alice" }]);
  assert.equal(state.users[0].name, "Bob");
  assert.equal(state.loading, false);
  assert.equal(state.totalItems, 1);
});

test("clearing input invalidates a pending search and restores browse mode", async () => {
  const hook = createHarness();
  hook.render("Alice");
  let state = hook.render("", "Alice");
  assert.equal(state.users[0].name, "Browse member");
  assert.equal(state.loading, false);

  state = await hook.respond("Alice", [{ id: "alice", name: "Alice" }]);
  assert.equal(state.users[0].name, "Browse member");
  assert.equal(state.totalItems, 0);
  assert.equal(state.loading, false);
});

test("changing organisation ignores the previous organisation's response", async () => {
  const hook = createHarness();
  hook.render("Alice", "Alice", "org-a");
  hook.render("Alice", "Alice", "org-b");

  let state = await hook.respond("Alice", [{ id: "old", name: "Old org" }]);
  assert.equal(state.loading, true);
  assert.equal(state.users.length, 0);

  state = await hook.respond("Alice", [{ id: "new", name: "New org" }]);
  assert.equal(state.users[0].name, "New org");
  assert.equal(state.loading, false);
});

test("obsolete pagination response cannot change the next query's state", async () => {
  const hook = createHarness();
  hook.render("Bob");
  let state = await hook.respond("Bob", [{ id: "bob", name: "Bob" }], {
    current_page: 1,
    total_pages: 2,
    total_items: 60,
  });
  assert.equal(state.hasMore, true);
  state.loadMore();

  hook.render("Alice", "Bob");
  state = hook.render("Alice");
  assert.equal(state.loading, true);

  state = await hook.respond("Bob", [{ id: "bob-2", name: "Bob 2" }], {
    current_page: 2,
    total_pages: 2,
    total_items: 60,
  });
  assert.equal(state.loading, true);
  assert.equal(state.hasMore, true);
  assert.equal(state.totalItems, 0);

  state = await hook.respond("Alice", [{ id: "alice", name: "Alice" }]);
  assert.equal(state.users[0].name, "Alice");
  assert.equal(state.hasMore, false);
  assert.equal(state.totalItems, 1);
});
