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
  interactionLocked = true; // Lock interaction while showing info box
  infoTitle.textContent = skill.dataset.name;
  infoCost.textContent = `Cost: ${skill.dataset.cost} Skill Points`;
  infoDescription.textContent = skill.dataset.description;
  infoBox.style.display = 'block';

  const center = getCenter(skill);

  // Apply the current scale and translation to the position
  const x = center.x * scale + translate.x;
  const y = center.y * scale + translate.y;

  infoBox.style.left = `${x - infoBox.offsetWidth / 2}px`;
  infoBox.style.top = `${y + 20}px`; // Slightly below the skill box
}


// Unlock skill
unlockBtn.addEventListener('click', () => {
  if (!currentSkill) return;

  const cost = parseInt(currentSkill.dataset.cost);
  const parentId = currentSkill.dataset.parent;

  // Check if the parent skill is unlocked
  if (parentId && !document.getElementById(parentId).classList.contains('unlocked')) {
    alert("You must unlock the parent skill first.");
    return;
  }

  // Check if there are enough skill points to unlock the skill
  if (skillPoints >= cost) {
    skillPoints -= cost;  // Deduct the skill points
    currentSkill.classList.add('unlocked');  // Mark the skill as unlocked
    updateSkillPointsDisplay();  // Update the skill points display
    infoBox.style.display = 'none';  // Hide the info box
    interactionLocked = false;  // Unlock interaction (pan/zoom)
  } else {
    alert("Not enough skill points.");
  }
});

// Cancel action (close the info box)
cancelBtn.addEventListener('click', () => {
  infoBox.style.display = 'none';  // Hide the info box
  currentSkill = null;  // Reset the current skill
  interactionLocked = false;  // Unlock interaction (pan/zoom)
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
  if (interactionLocked) return;
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
