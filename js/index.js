const input = document.getElementById("channel-input");
const copyBtn = document.getElementById("copy-btn");
const linkEl = document.getElementById("game-link");
const autoRestartEl = document.getElementById("opt-auto-restart");

function copyLink() {
  const name = input.value.trim().toLowerCase() || "Ku6ep_XBOCTuK";
  const autoRestart = autoRestartEl.checked ? "1" : "0";
  const url = `${location.origin}${location.pathname.replace(/\/[^/]*$/, "/")}game.html?channel=${encodeURIComponent(name)}&autoRestart=${autoRestart}`;
  navigator.clipboard.writeText(url).then(() => {
    linkEl.textContent = "СКОПИРОВАНО!";
    linkEl.className = "copied";
  });
}

copyBtn.addEventListener("click", copyLink);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") copyLink();
});
