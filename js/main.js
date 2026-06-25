(function initUI() {
  document.getElementById("start-subtitle").textContent = CONFIG.texts.startSubtitle;
  document.getElementById("gameover-title").textContent = CONFIG.texts.gameOverTitle;
  document.getElementById("gameover-subtitle").textContent = CONFIG.texts.gameOverSubtitle;

  document.querySelector("#ui-overlay .ui-text:nth-child(1)").innerHTML =
    `${CONFIG.texts.scoreLabel} <span id="score">0</span>`;
  document.querySelector("#ui-overlay .ui-text:nth-child(2)").innerHTML =
    `${CONFIG.texts.waveLabel} <span id="wave">1</span>`;
  document.querySelector("#ui-overlay .ui-text:nth-child(3)").innerHTML =
    `${CONFIG.texts.livesLabel} <span id="lives">${"♥".repeat(CONFIG.game.startLives)}</span>`;

  document.querySelector("#gameover-screen .screen-subtitle").innerHTML =
    `${CONFIG.texts.finalScoreLabel} <span id="final-score">0</span>`;
})();

const gameParams = new URLSearchParams(location.search);
const channel = gameParams.get("channel") || "ku6ep_xboctuk";
const channelName = channel;
const client = new tmi.Client({ channels: [channel] });
client.connect();

client.on("message", (channel, tags, message, self) => {
  const username = tags["display-name"] || tags.username || "anonymous";
  InputModule.submitLine(message, username);
});

initKeyboardBridge();

window.addEventListener("resize", recalc);
recalc();
runIntro();
