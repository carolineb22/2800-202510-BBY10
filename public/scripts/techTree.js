const skills = document.querySelectorAll('.skill');
const svg = document.getElementById('connectorSVG');

let skillPoints = 0;
const skillPointsDisplay = document.getElementById('skillPoints');
const addPointBtn = document.getElementById('addPointBtn');

const infoBox = document.getElementById('infoBox');
const infoTitle = document.getElementById('infoTitle');
const infoCost = document.getElementById('infoCost');
const infoDescription = document.getElementById('infoDescription');
const unlockBtn = document.getElementById('unlockBtn');
const cancelBtn = document.getElementById('cancelBtn');

const treeContainer = document.getElementById('treeContainer');
const treeWrapper = document.getElementById('treeWrapper');

let currentSkill = null;
let scale = 1;
let translate = { x: 0, y: 0 };
let interactionLocked = false;

// Update skill point display
function updateSkillPointsDisplay() {
  skillPointsDisplay.textContent = `Skill Points: ${skillPoints}`;
}

// Draw skill connectors using SVG
function drawLines() {
  svg.innerHTML = '';

  skills.forEach(skill => {
    const parentId = skill.dataset.parent;
    if (parentId) {
      const parent = document.getElementById(parentId);
      if (parent) {
        const start = getCenter(parent);
        const end = getCenter(skill);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', start.x);
        line.setAttribute('y1', start.y);
        line.setAttribute('x2', end.x);
        line.setAttribute('y2', end.y);
        line.setAttribute('stroke-width', '2');

        // Determine color
        if (skill.classList.contains('unlocked')) {
          line.setAttribute('stroke', '#00ff80'); // green = unlocked
        } else if (parent.classList.contains('unlocked')) {
          line.setAttribute('stroke', '#00e5ff'); // blue = available
        } else {
          line.setAttribute('stroke', '#888'); // gray = locked
        }

        svg.appendChild(line);
      }
    }
  });
}

// Get center of a skill box
function getCenter(elem) {
  return {
    x: elem.offsetLeft + elem.offsetWidth / 2,
    y: elem.offsetTop + elem.offsetHeight / 2
  };
}

// Show info box
function showInfoBox(skill) {
  interactionLocked = true;
  infoTitle.textContent = skill.dataset.name;
  infoCost.textContent = `Cost: ${skill.dataset.cost} Skill Points`;
  infoDescription.textContent = skill.dataset.description;
  infoBox.style.display = 'block';

  const center = getCenter(skill);
  const x = center.x * scale + translate.x;
  const y = center.y * scale + translate.y;

  infoBox.style.left = `${x - infoBox.offsetWidth / 2}px`;
  infoBox.style.top = `${y + 20}px`;
}

// Update which skills are enabled/disabled based on their parent
function updateSkillStates() {
  skills.forEach(skill => {
    const parentId = skill.dataset.parent;

    if (!parentId) {
      skill.classList.remove('disabled');
      return;
    }

    const parent = document.getElementById(parentId);
    if (parent && parent.classList.contains('unlocked')) {
      skill.classList.remove('disabled');
    } else {
      skill.classList.add('disabled');
    }
  });
}

// Unlock button
unlockBtn.addEventListener('click', () => {
  if (!currentSkill) return;

  const cost = parseInt(currentSkill.dataset.cost);
  const parentId = currentSkill.dataset.parent;

  if (parentId && !document.getElementById(parentId).classList.contains('unlocked')) {
    alert("You must unlock the parent skill first.");
    return;
  }

  if (skillPoints >= cost) {
    skillPoints -= cost;
    currentSkill.classList.add('unlocked');
    updateSkillPointsDisplay();
    updateSkillStates();
    drawLines();
    infoBox.style.display = 'none';
    interactionLocked = false;
  } else {
    alert("Not enough skill points.");
  }
});

// Cancel button
cancelBtn.addEventListener('click', () => {
  infoBox.style.display = 'none';
  currentSkill = null;
  interactionLocked = false;
});

// Add skill point button
addPointBtn.addEventListener('click', () => {
  skillPoints++;
  updateSkillPointsDisplay();
});

// Set up each skill block
skills.forEach(skill => {
  skill.innerHTML = `${skill.dataset.name}<br>(Cost: ${skill.dataset.cost})`;

  skill.addEventListener('click', () => {
    if (skill.classList.contains('disabled')) return;
    currentSkill = skill;
    showInfoBox(skill);
  });
});

// Zoom
treeWrapper.addEventListener('wheel', e => {
  if (interactionLocked) return;
  e.preventDefault();

  const scaleFactor = 1.1;
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  const worldX = (mouseX - translate.x) / scale;
  const worldY = (mouseY - translate.y) / scale;

  scale = e.deltaY < 0 ? scale * scaleFactor : scale / scaleFactor;

  translate.x = mouseX - worldX * scale;
  translate.y = mouseY - worldY * scale;

  treeContainer.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
  drawLines();
});

// Pan
let isDragging = false;
let startX, startY;

treeWrapper.addEventListener('mousedown', (e) => {
  if (interactionLocked) return;
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  startX = e.clientX;
  startY = e.clientY;

  translate.x += dx;
  translate.y += dy;

  treeContainer.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
  drawLines();
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

window.addEventListener('load', () => {
  updateSkillPointsDisplay();
  drawLines();
  updateSkillStates(); // Initialize skill enable/disable state
});
