import { animate } from "motion";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const dialogs = new Map();
let lastTrigger = null;
let generation = 0;
let mediaCleanup = null;
const year = document.querySelector("#year");
year.textContent = String(new Date().getFullYear());

function clearMedia() {
  generation++;
  mediaCleanup?.();
  mediaCleanup = null;
}
function close(dialog) {
  clearMedia();
  dialog.close();
  lastTrigger?.focus({ preventScroll: true });
}
for (const dialog of document.querySelectorAll("dialog")) {
  dialogs.set(dialog.id, dialog);
  dialog
    .querySelector(".close-dialog")
    .addEventListener("click", () => close(dialog));
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close(dialog);
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      close(dialog);
  });
}
function loading(container, text) {
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  status.textContent = text;
  container.replaceChildren(status);
}
async function loadMedia(kind, dialog) {
  clearMedia();
  const ticket = generation;
  const container = document.querySelector(`#${kind}-mount`);
  loading(container, "Preparando a experiência…");
  try {
    if (kind === "reel") {
      const { mountReel } = await import("./reel.jsx");
      if (ticket !== generation || !dialog.open) return;
      mediaCleanup = mountReel(container, { autoplay: !reduceMotion.matches });
    } else {
      await import("@hyperframes/player");
      if (ticket !== generation || !dialog.open) return;
      const player = document.createElement("hyperframes-player");
      player.setAttribute(
        "src",
        new URL("./frame.html", document.baseURI).href,
      );
      player.setAttribute(
        "runtime-src",
        new URL("./assets/vendor/hyperframe.runtime.js", document.baseURI).href,
      );
      player.setAttribute("controls", "");
      player.setAttribute("width", "1280");
      player.setAttribute("height", "720");
      player.setAttribute("aria-label", "Composição de tipografia Frame");
      player.addEventListener(
        "error",
        () => showError(container, kind, dialog),
        { once: true },
      );
      container.replaceChildren(player);
      mediaCleanup = () => {
        player.pause();
        player.remove();
      };
    }
  } catch (error) {
    console.error("Falha ao preparar demonstração", error);
    if (ticket === generation && dialog.open)
      showError(container, kind, dialog);
  }
}
function showError(container, kind, dialog) {
  const block = document.createElement("div");
  block.className = "error-container";
  const message = document.createElement("p");
  message.setAttribute("role", "alert");
  message.textContent = "Não foi possível carregar a demonstração.";
  const retry = document.createElement("button");
  retry.className = "error-retry";
  retry.textContent = "Tentar novamente";
  retry.addEventListener("click", () => loadMedia(kind, dialog));
  block.append(message, retry);
  container.replaceChildren(block);
}
for (const button of document.querySelectorAll("[data-open]")) {
  button.disabled = false;
  button.addEventListener("click", () => {
    const kind = button.dataset.open;
    const dialog = dialogs.get(`${kind}-dialog`);
    lastTrigger = button;
    dialog.showModal();
    dialog.scrollTop = 0;
    if (kind !== "aura") loadMedia(kind, dialog);
  });
}

// A real selection flow in the concept: bounded quantities, live feedback and reset.
let quantity = 1;
let selected = 0;
const output = document.querySelector("#quantity-output");
const minus = document.querySelector("#quantity-minus");
const plus = document.querySelector("#quantity-plus");
const status = document.querySelector("#selection-status");
const clear = document.querySelector("#clear-selection");
const add = document.querySelector("#add-selection");
function syncQuantity() {
  output.textContent = String(quantity);
  minus.disabled = quantity === 1;
  plus.disabled = quantity === 5;
}
minus.addEventListener("click", () => {
  quantity = Math.max(1, quantity - 1);
  syncQuantity();
});
plus.addEventListener("click", () => {
  quantity = Math.min(5, quantity + 1);
  syncQuantity();
});
add.addEventListener("click", () => {
  selected += quantity;
  status.textContent = `${selected} ${selected === 1 ? "unidade adicionada" : "unidades adicionadas"} à seleção. Esta é uma demonstração, sem compra.`;
  clear.hidden = false;
  if (!reduceMotion.matches)
    animate(add, { scale: [1, 0.97, 1] }, { duration: 0.32, ease: "easeOut" });
});
clear.addEventListener("click", () => {
  selected = 0;
  status.textContent = "Seleção limpa. Nenhuma compra foi realizada.";
  clear.hidden = true;
  add.focus();
});
syncQuantity();
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden =
      !active;
  }
  const panel = document.getElementById(tab.getAttribute("aria-controls"));
  if (!reduceMotion.matches)
    animate(panel, { opacity: [0.4, 1], y: [4, 0] }, { duration: 0.22 });
}
for (const tab of tabs) {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let index = tabs.indexOf(tab);
    index =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
    selectTab(tabs[index]);
    tabs[index].focus();
  });
}
// One short opening sequence; no scroll hijacking or perpetual background animation.
if (!reduceMotion.matches) {
  animate(
    ".hero h1",
    { opacity: [0.35, 1], y: [14, 0] },
    { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] },
  );
}
