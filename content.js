(() => {
  const root = document.documentElement;
  const KEY = "ocuEnabled";

  const RELABEL = new Map([
    ["Notebooks", "Projects"],
    ["Auto", "Smart"],
  ]);
  const HIDE = new Set(["Chats"]);

  let enabled = true;
  let scheduled = false;

  function setEnabled(v) {
    enabled = v !== false;
    root.classList.toggle("ocu", enabled);
    if (enabled) schedule();
  }

  function relabel() {
    scheduled = false;
    if (!enabled) return;
    const scope = document.querySelector('[role="navigation"].fai-CopilotNavDrawer') || document.body;
    if (!scope) return;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = n.nodeValue.trim();
      if (RELABEL.has(t) && n.nodeValue !== n.nodeValue.replace(t, RELABEL.get(t))) {
        n.nodeValue = n.nodeValue.replace(t, RELABEL.get(t));
      }
    }
    // Model selector label ("Auto" -> "Smart")
    const sel = document.querySelector('button[aria-label="Auto, Model Selector"]');
    if (sel) {
      const w = document.createTreeWalker(sel, NodeFilter.SHOW_TEXT);
      let m;
      while ((m = w.nextNode())) if (m.nodeValue.trim() === "Auto") m.nodeValue = m.nodeValue.replace("Auto", "Smart");
    }
    // Hide section headers
    scope.querySelectorAll(".fai-CopilotNavItem, .fai-SplitCopilotNavCategoryItem, h2, h3, span").forEach((el) => {
      if (el.children.length === 0 && HIDE.has(el.textContent.trim()) && el.closest(".fai-CopilotNavDrawerBody")) {
        const h = el.closest("[role='heading'], h2, h3") || null;
        if (h) h.classList.add("ocu-hide");
      }
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(relabel);
  }

  // Apply immediately (default on) to avoid a flash, then sync with storage.
  setEnabled(true);
  try {
    chrome.storage.sync.get(KEY, (r) => setEnabled(r[KEY]));
    chrome.storage.onChanged.addListener((c) => {
      if (c[KEY]) setEnabled(c[KEY].newValue);
    });
  } catch (_) {}

  const start = () => {
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
    schedule();
  };
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
