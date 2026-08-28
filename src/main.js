const frame = document.getElementById("frame");
const buttons = document.querySelectorAll(".filmstrip button");

for (const button of buttons) {
  button.addEventListener("click", () => {
    const src = button.dataset.src;
    const label = button.dataset.label;
    if (!src || !frame) return;

    frame.src = src;
    frame.alt = `Memento Mori poster: ${label}`;

    for (const other of buttons) {
      other.classList.toggle("is-active", other === button);
    }
  });
}
