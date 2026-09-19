(() => {
  "use strict";

  const STORAGE_KEY = "genspark.dev.v1";
  const MODES = {
    idle: ["IDLE", "Waiting for a construction target."],
    scan: ["SCAN", "Mapping files, dependencies, state, routes, and assumptions."],
    build: ["BUILD", "Constructing the smallest coherent change."],
    debug: ["DEBUG", "Tracing symptom → execution path → divergence → cause."],
    test: ["TEST", "Trying to falsify the current construction."],
    audit: ["AUDIT", "Looking for contradictions, duplication, dead paths, and unsafe assumptions."],
    ship: ["SHIP", "Preparing a verified whole to become the next +1."]
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const defaults = {
    repo: "Iansogotthis/metameet",
    branch: "feature/genspark-developer-environment",
    mode: "idle",
    projectMap: [
      { path: "README.md", relation: "Repository deployment/archive overview" },
      { path: "deploy/", relation: "Deployment notes and configuration shell" },
      { path: "GROVE7_REALITY_STACK_DEPLOY.zip", relation: "Bundled Grove 7 distribution" },
      { path: "metameet_welcome_chamber_vidspark_fixed.zip", relation: "Bundled welcome chamber distribution" },
      { path: "genspark-dev/", relation: "gENSP.A.R.K developer environment" }
    ],
    trace: {
      target: "No task yet.",
      map: "Repository map ready.",
      evidence: "No runtime evidence yet.",
      gap: "Unestablished.",
      patch: "Unestablished.",
      test: "Built-in self-test available.",
      status: "UNESTABLISHED",
      plus: "No reusable capacity recorded yet."
    },
    diff: "",
    logs: []
  };

  let state = load();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...clone(defaults), ...JSON.parse(raw) } : clone(defaults);
    } catch {
      return clone(defaults);
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $("#savedAt").textContent = "memory written " + new Date().toLocaleTimeString();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
  }

  function log(message, tag = "GEN") {
    const entry = { at: new Date().toLocaleTimeString(), tag, message };
    state.logs = [...(state.logs || []), entry].slice(-80);
    renderLogs();
    save();
  }

  function renderLogs() {
    const el = $("#consoleLog");
    if (!state.logs?.length) {
      el.innerHTML = '<p class="log-line"><b>GEN</b> Ready. Authorized tool requests will appear here.</p>';
      return;
    }
    el.innerHTML = state.logs.map((item) =>
      '<p class="log-line"><b>' + escapeHtml(item.tag) + '</b> [' + escapeHtml(item.at) + '] ' + escapeHtml(item.message) + '</p>'
    ).join("");
    el.scrollTop = el.scrollHeight;
  }

  function setMode(mode, reason = "") {
    if (!MODES[mode]) mode = "idle";
    state.mode = mode;
    document.body.dataset.mode = mode;
    $("#modeChip").textContent = MODES[mode][0];
    $("#stateName").textContent = MODES[mode][0];
    $("#stateMessage").textContent = reason || MODES[mode][1];
    $$("#modeGrid button").forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.mode === mode)));
    save();
  }

  function setTrace(patch) {
    state.trace = { ...state.trace, ...patch };
    const selectors = {
      target: "#traceTarget", map: "#traceMap", evidence: "#traceEvidence", gap: "#traceGap",
      patch: "#tracePatch", test: "#traceTest", status: "#traceStatus", plus: "#tracePlus"
    };
    Object.entries(selectors).forEach(([key, selector]) => {
      $(selector).textContent = state.trace[key];
    });
    save();
  }

  function renderMap() {
    $("#projectMap").innerHTML = state.projectMap.map((item, index) =>
      '<li><span class="map-dot"></span><span><code>' + escapeHtml(item.path) + '</code><br>' +
      escapeHtml(item.relation) + '</span><button class="remove-map" data-remove-map="' + index + '" aria-label="Remove relation">×</button></li>'
    ).join("");
  }

  function renderDiff() {
    $("#diffInput").value = state.diff || "";
    const lines = (state.diff || "").split("\n");
    const files = new Set();
    let adds = 0;
    let deletes = 0;
    for (const line of lines) {
      if (line.startsWith("+++ b/")) files.add(line.slice(6));
      if (line.startsWith("+") && !line.startsWith("+++")) adds += 1;
      if (line.startsWith("-") && !line.startsWith("---")) deletes += 1;
    }
    $("#diffFiles").textContent = files.size + (files.size === 1 ? " file" : " files");
    $("#diffAdds").textContent = "+" + adds;
    $("#diffDeletes").textContent = "-" + deletes;
  }

  function requestTool(tool, args = {}) {
    setMode(tool.includes("test") ? "test" : tool.includes("diff") ? "audit" : "scan");
    log("Requesting host tool: " + tool, "TOOL");
    $("#bridgeState").textContent = "host bridge: request sent";
    const detail = {
      id: "req_" + Date.now(),
      tool,
      args,
      repo: state.repo,
      branch: state.branch
    };
    window.dispatchEvent(new CustomEvent("genspark:tool-request", { detail }));
    return detail;
  }

  function receiveToolResult(result = {}) {
    $("#bridgeState").textContent = "host bridge: connected";
    log((result.tool || "host") + " → " + (result.status || "result") + (result.summary ? ": " + result.summary : ""), "HOST");

    if (Array.isArray(result.projectMap) && result.projectMap.length) {
      state.projectMap = result.projectMap;
      renderMap();
    }
    if (typeof result.diff === "string") {
      state.diff = result.diff;
      renderDiff();
    }
    if (result.trace) setTrace(result.trace);
    if (result.mode && MODES[result.mode]) setMode(result.mode, result.message || "");
    save();
  }

  function runTask(task) {
    const text = task.trim();
    if (!text) return;

    const inferred = /bug|fail|broken|error|crash|fix/i.test(text) ? "debug"
      : /test|verify|check/i.test(text) ? "test"
      : /ship|deploy|publish/i.test(text) ? "ship"
      : /audit|inspect|review/i.test(text) ? "audit"
      : "scan";

    setMode(inferred);
    setTrace({
      target: text,
      map: "Mapping the structures capable of producing the requested behavior.",
      evidence: "Awaiting repository/runtime evidence from the authorized host.",
      gap: "Candidate gap not yet verified.",
      patch: "No patch until the causal relation is established.",
      test: "Verification method will be selected from the available environment.",
      status: "HYPOTHESIS",
      plus: "Pending verified repair."
    });
    log("Target accepted: " + text, "TASK");
    requestTool("developer.task", { task: text, coderCore: true });
  }

  function runSelfTests() {
    setMode("test");
    const checks = [
      ["DOM shell", !!$("#spark") && !!$("#taskForm") && !!$("#consoleLog")],
      ["Local memory", (() => {
        try {
          localStorage.setItem("genspark.test", "1");
          localStorage.removeItem("genspark.test");
          return true;
        } catch {
          return false;
        }
      })()],
      ["Mode state machine", Object.keys(MODES).length === 7],
      ["Host request API", typeof requestTool === "function"],
      ["Host result API", typeof receiveToolResult === "function"],
      ["Project map", Array.isArray(state.projectMap) && state.projectMap.length > 0]
    ];

    $("#testResults").innerHTML = checks.map(([name, pass]) =>
      '<li class="' + (pass ? "pass" : "fail") + '">' + (pass ? "PASS" : "FAIL") + " — " + escapeHtml(name) + "</li>"
    ).join("");

    const passed = checks.filter(([, pass]) => pass).length;
    $("#testSummary").textContent = passed + "/" + checks.length + " local checks passed.";
    setTrace({
      test: passed + "/" + checks.length + " local UI/bridge checks passed.",
      status: passed === checks.length ? "VERIFIED (LOCAL UI)" : "FAILED"
    });
    log("Local self-test: " + passed + "/" + checks.length + " passed.", "TEST");
  }

  $$("#modeGrid button").forEach((btn) => btn.addEventListener("click", () => {
    setMode(btn.dataset.mode);
    log("Manual mode → " + btn.dataset.mode.toUpperCase(), "MODE");
  }));

  $("#taskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    runTask($("#taskInput").value);
  });

  $("#clearTaskBtn").addEventListener("click", () => {
    $("#taskInput").value = "";
  });

  $("#clearTraceBtn").addEventListener("click", () => {
    state.trace = clone(defaults.trace);
    setTrace(state.trace);
    state.logs = [];
    renderLogs();
    save();
  });

  $("#pulseBtn").addEventListener("click", () => {
    $("#spark").animate([
      { transform: "scale(1)" },
      { transform: "scale(1.28) rotate(28deg)", filter: "brightness(1.7)" },
      { transform: "scale(1)" }
    ], { duration: 620, easing: "cubic-bezier(.2,.8,.2,1)" });
    setTrace({ plus: "Manual +1 pulse recorded: a whole is available for the next construction." });
    log("Verified-whole marker pulsed.", "+1");
  });

  $("#addMapBtn").addEventListener("click", () => {
    const path = prompt("File, component, route, or system:");
    if (!path) return;
    const relation = prompt("What relation does it carry?") || "Relation not yet described.";
    state.projectMap.push({ path, relation });
    renderMap();
    save();
  });

  $("#projectMap").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-map]");
    if (!button) return;
    state.projectMap.splice(Number(button.dataset.removeMap), 1);
    renderMap();
    save();
  });

  $$("[data-tool]").forEach((btn) => btn.addEventListener("click", () => {
    requestTool(btn.dataset.tool);
  }));

  $("#saveDiffBtn").addEventListener("click", () => {
    state.diff = $("#diffInput").value;
    renderDiff();
    setTrace({
      evidence: state.diff.trim() ? "A diff has been supplied for inspection." : "No diff supplied.",
      status: state.diff.trim() ? "OBSERVED" : "UNESTABLISHED"
    });
    log("Diff snapshot stored in project memory.", "DIFF");
    save();
  });

  $("#clearDiffBtn").addEventListener("click", () => {
    state.diff = "";
    renderDiff();
    save();
  });

  $("#selfTestBtn").addEventListener("click", runSelfTests);

  $("#previewBtn").addEventListener("click", () => {
    const url = $("#previewUrl").value.trim();
    if (!url) return;
    $("#previewFrame").src = url;
    log("Browser preview requested for " + url, "BROWSER");
  });

  $("#openPreviewBtn").addEventListener("click", () => {
    const url = $("#previewUrl").value.trim();
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  window.addEventListener("genspark:tool-result", (event) => receiveToolResult(event.detail));
  window.gensparkDev = Object.freeze({
    requestTool,
    receiveToolResult,
    setMode,
    setTrace,
    getState: () => clone(state)
  });

  $("#repoChip").textContent = "repo: " + state.repo;
  $("#branchChip").textContent = "branch: " + state.branch;
  setTrace(state.trace);
  renderMap();
  renderDiff();
  renderLogs();
  setMode(state.mode || "idle");
  log("Coder Core online. Browser layer is credential-free; privileged work goes through the host bridge.", "BOOT");
})();