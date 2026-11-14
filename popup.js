const t = document.getElementById("t");
chrome.storage.sync.get("ocuEnabled", (r) => { t.checked = r.ocuEnabled !== false; });
t.addEventListener("change", () => chrome.storage.sync.set({ ocuEnabled: t.checked }));
