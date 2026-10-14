const MESSAGES = {
  es: {
    notGitHub: "Esto no es un repositorio de GitHub :(",
    invalidRepo: "Entra a una página de repositorio válida.",
    privateOrError: "No se consigue descargar: El repositorio es privado o no existe.",
    downloading: (repo) => `Iniciando descarga de ${repo}...`
  },
  en: {
    notGitHub: "This is not a GitHub repository :(",
    invalidRepo: "Please navigate to a valid repository page.",
    privateOrError: "Cannot download: The repository is private or does not exist.",
    downloading: (repo) => `Starting download for ${repo}...`
  }
};

const RESERVED = new Set([
  "settings", "orgs", "features", "marketplace", "topics", "explore",
  "notifications", "pulls", "issues", "sponsors", "login", "signup", "join",
  "new", "search", "trending", "collections", "about", "pricing", "enterprise",
  "apps", "codespaces", "organizations", "users", "account", "sessions",
  "watching", "stars", "dashboard", "security", "events", "contact", "team",
  "solutions", "resources", "premium-support", "customer-stories"
]);

const NAME_RE = /^(?!\.+$)[A-Za-z0-9_.-]+$/;
const pending = new Map();

function showPopup(message, isSuccess) {
  const old = document.getElementById("ggz-popup");
  if (old) old.remove();
  const popup = document.createElement("div");
  popup.id = "ggz-popup";
  popup.textContent = message;
  Object.assign(popup.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#161b22",
    color: "#f0f6fc",
    border: "1px solid #30363d",
    borderLeft: isSuccess ? "4px solid #238636" : "4px solid #da3633",
    padding: "12px 20px",
    borderRadius: "6px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    zIndex: "999999",
    boxShadow: "0px 8px 24px rgba(0,0,0,0.3)",
    transition: "opacity 0.3s ease, transform 0.3s ease"
  });
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translateY(-10px)";
    setTimeout(() => popup.remove(), 300);
  }, 2500);
}

function notify(tabId, message, isSuccess) {
  chrome.scripting
    .executeScript({ target: { tabId }, func: showPopup, args: [message, isSuccess] })
    .catch(() => {
      chrome.action.setBadgeText({ tabId, text: isSuccess ? "OK" : "!" });
      setTimeout(() => chrome.action.setBadgeText({ tabId, text: "" }), 2500);
    });
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id || !tab.url) return;

  const text = MESSAGES[chrome.i18n.getUILanguage().startsWith("es") ? "es" : "en"];

  let url;
  try {
    url = new URL(tab.url);
  } catch {
    return;
  }

  if (url.hostname !== "github.com") {
    notify(tab.id, text.notGitHub, false);
    return;
  }

  const [user, repo] = url.pathname.split("/").filter(Boolean);

  if (!repo || RESERVED.has(user.toLowerCase()) || !NAME_RE.test(user) || !NAME_RE.test(repo)) {
    notify(tab.id, text.invalidRepo, false);
    return;
  }

  notify(tab.id, text.downloading(repo), true);

  chrome.downloads.download(
    {
      url: `https://github.com/${user}/${repo}/archive/HEAD.zip`,
      filename: `${repo}.zip`,
      saveAs: false
    },
    (id) => {
      const err = chrome.runtime.lastError;
      if (err || id === undefined) {
        if (!/cancel/i.test(err?.message || "")) {
          notify(tab.id, text.privateOrError, false);
        }
        return;
      }
      pending.set(id, { tabId: tab.id, error: text.privateOrError });
    }
  );
});

chrome.downloads.onChanged.addListener((delta) => {
  const item = pending.get(delta.id);
  if (!item || !delta.state) return;
  pending.delete(delta.id);
  if (delta.state.current !== "interrupted") return;
  chrome.downloads.search({ id: delta.id }, ([download]) => {
    if (download && download.error !== "USER_CANCELED") {
      notify(item.tabId, item.error, false);
    }
  });
});