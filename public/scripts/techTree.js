const skills = document.querySelectorAll('.skill');
const svg = document.getElementById('connectorSVG'); // Reference to the SVG container

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

// Update skill point display
function updateSkillPointsDisplay() {
  skillPointsDisplay.textContent = `Skill Points: ${skillPoints}`;
}

// Draw skill connectors using SVG
function drawLines() {
  svg.innerHTML = ''; // Clear old lines

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
        line.setAttribute('stroke', '#444');
        line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
      }
    }
  });
}

// Get center position of an element relative to treeContainer
function getCenter(elem) {
  return {
    x: elem.offsetLeft + elem.offsetWidth / 2,
    y: elem.offsetTop + elem.offsetHeight / 2
  };
}

// Show info box near skill
function showInfoBox(skill) {
  infoTitle.textContent = skill.dataset.name;
  infoCost.textContent = `Cost: ${skill.dataset.cost} Skill Points`;
  infoDescription.textContent = skill.dataset.description;
  infoBox.style.display = 'block';

  infoBox.style.left = (skill.offsetLeft + skill.offsetWidth / 2 - 100) * scale + translate.x + 'px';
  infoBox.style.top = (skill.offsetTop + skill.offsetHeight + 10) * scale + translate.y + 'px';
}

// Unlock skill
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
    infoBox.style.display = 'none';
  } else {
    alert("Not enough skill points.");
  }
});

cancelBtn.addEventListener('click', () => {
  infoBox.style.display = 'none';
  currentSkill = null;
});

// Add skill point
addPointBtn.addEventListener('click', () => {
  skillPoints++;
  updateSkillPointsDisplay();
});

// Skill click
skills.forEach(skill => {
  skill.innerHTML = `${skill.dataset.name}<br>(Cost: ${skill.dataset.cost})`;
  skill.addEventListener('click', () => {
    currentSkill = skill;
    showInfoBox(skill);
  });
});

// Zoom and Pan
let isDragging = false;
let startX, startY;

// Zoom functionality
treeWrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const scaleFactor = 1.1;
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  const worldX = (mouseX - translate.x) / scale;
  const worldY = (mouseY - translate.y) / scale;

  if (e.deltaY < 0) {
    scale *= scaleFactor;
  } else {
    scale /= scaleFactor;
  }

  translate.x = mouseX - worldX * scale;
  translate.y = mouseY - worldY * scale;

  // Apply scaling and translation to the entire skill tree and SVG
  treeContainer.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
  drawLines();
});

// Enable dragging of the skill tree
treeWrapper.addEventListener('mousedown', (e) => {
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

  // Apply the same transformation to both container and SVG
  treeContainer.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
  drawLines(); // Redraw connector lines
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

window.addEventListener('load', () => {
  updateSkillPointsDisplay();
  drawLines();
});
