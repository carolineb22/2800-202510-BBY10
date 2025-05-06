const terminal = document.getElementById("terminal");
const progressFill = document.getElementById("progress-fill");


const lines = [
  ">> Connecting to Global Server...",
  ">> ERROR: /404 resource not found.",
  ">> Coordination protocol failed.",
  ">> Initiating fallback...",
  ">> FAILURE.",
  ">> Hope Level: LOW",
  ">> Awaiting user intervention..."
];

let i = 0;

function typeLine() {
  if (i < lines.length) {
    terminal.innerHTML += lines[i++] + "<br>";
    terminal.scrollTop = terminal.scrollHeight;

    if (lines[i - 1] === ">> FAILURE.") {
      progressFill.classList.add('failure');
    }

    setTimeout(typeLine, 800);
  }
}

typeLine();

// Add console log for flavor
console.log("404 SYSTEM LOG: The page failed... but unity might still be possible.");

