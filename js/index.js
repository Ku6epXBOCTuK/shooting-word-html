const input = document.getElementById("channel-input");
const copyBtn = document.getElementById("copy-btn");
const openBtn = document.getElementById("open-btn");
const linkEl = document.getElementById("game-link");
const singlePlayEl = document.getElementById("opt-single-play");

function buildUrl() {
  const name = input.value.trim().toLowerCase() || "Ku6ep_XBOCTuK";
  const single = singlePlayEl.checked ? "1" : "0";
  return `${location.origin}${location.pathname.replace(/\/[^/]*$/, "/")}game?channel=${encodeURIComponent(name)}&singlePlay=${single}`;
}

function updateLink() {
  linkEl.textContent = buildUrl();
  linkEl.className = "";
}

function copyLink() {
  navigator.clipboard.writeText(buildUrl()).then(() => {
    linkEl.textContent = "СКОПИРОВАНО!";
    linkEl.className = "copied";
    setTimeout(updateLink, 1500);
  });
}

function openLink() {
  window.open(buildUrl(), "_blank");
}

input.addEventListener("input", updateLink);
singlePlayEl.addEventListener("change", updateLink);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") copyLink();
});

copyBtn.addEventListener("click", copyLink);
openBtn.addEventListener("click", openLink);

updateLink();

document.querySelector(".hint-toggle").addEventListener("click", () => {
  document.querySelector(".settings-hints").classList.toggle("hidden");
});
