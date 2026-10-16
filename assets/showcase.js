// Progressive enhancement: every concept remains accessible without JavaScript.
(() => {
  const filters = document.querySelector(".showcase-filters");
  if (!filters) return;
  const cards = [...document.querySelectorAll(".showcase-card")];
  const count = document.querySelector(".showcase-count");
  const buttons = [...filters.querySelectorAll("button")];
  filters.hidden = false;
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      for (const item of buttons)
        item.setAttribute("aria-pressed", String(item === button));
      let visible = 0;
      for (const card of cards) {
        card.hidden = category !== "all" && card.dataset.category !== category;
        if (!card.hidden) visible++;
      }
      count.textContent = `${visible} ${visible === 1 ? "conceito para explorar" : "conceitos para explorar"}`;
    });
  }
})();
