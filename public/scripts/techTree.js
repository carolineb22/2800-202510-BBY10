const skills = document.querySelectorAll('.skill');
const svg = document.getElementById('connectorSVG');

let skillPoints = 0;
const skillPointsDisplay = document.getElementById('skillPoints');

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

// Load unlocked skills from the tree
function loadUnlockedSkills() {
    databaseUnlocks.forEach(unlock => {
        document.getElementById(unlock).classList.add("unlocked");
    });
}

// Update skill point display
function updateSkillPointsDisplay() {
  skillPointsDisplay.textContent = `Research Points: ${skillPoints}`;
}

// Draw skill connectors using SVG
function drawLines() {
  svg.innerHTML = '';

  // 1. Calculate bounding box of all skills
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  skills.forEach(skill => {
    const left = parseFloat(skill.style.left);
    const top = parseFloat(skill.style.top);
    const width = skill.offsetWidth;
    const height = skill.offsetHeight;

    const x = left;
    const y = top;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  // Add padding
  const padding = 100;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  // 2. Resize and reposition the SVG
  svg.setAttribute("width", maxX - minX);
  svg.setAttribute("height", maxY - minY);
  svg.style.left = `${minX}px`;
  svg.style.top = `${minY}px`;

  // 3. Draw lines adjusted to new SVG origin
  skills.forEach(skill => {
    const parentId = skill.dataset.parent;
    if (parentId) {
      const parent = document.getElementById(parentId);
      if (parent) {
        const start = getCenter(parent);
        const end = getCenter(skill);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', start.x - minX);
        line.setAttribute('y1', start.y - minY);
        line.setAttribute('x2', end.x - minX);
        line.setAttribute('y2', end.y - minY);
        line.setAttribute('stroke-width', '2');

        if (skill.classList.contains('unlocked')) {
          line.setAttribute('stroke', '#00ff80');
        } else if (parent.classList.contains('unlocked')) {
          line.setAttribute('stroke', '#00e5ff');
        } else {
          line.setAttribute('stroke', '#888');
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
  currentSkill = skill;

  const isUnlocked = skill.classList.contains('unlocked');
  const { name, description, cost, requirements = '' } = skill.dataset;

  infoTitle.textContent = name;
  infoDescription.innerHTML = description;
  infoCost.style.display = isUnlocked ? 'none' : 'block';
  unlockBtn.style.display = isUnlocked ? 'none' : 'inline-block';
  infoCost.textContent = `Cost: ${cost} Skill Points`;

  if (!isUnlocked && requirements) {
    const reqHTML = requirements.split(',').map(id => {
      const req = document.getElementById(id.trim());
      const met = req?.classList.contains('unlocked');
      const color = met ? 'limegreen' : 'red';
      const reqName = req?.dataset.name || id;
      return `<span style="color: ${color};">${reqName}</span>`;
    }).join(', ');
    infoDescription.innerHTML += `<br><strong>Requires:</strong> ${reqHTML}`;
  }

  const { x, y } = getCenter(skill);
  infoBox.style.left = `${x * scale + translate.x - infoBox.offsetWidth / 2}px`;
  infoBox.style.top = `${y * scale + translate.y + 20}px`;
  infoBox.style.display = 'block';
}



// Update which skills are enabled/disabled based on their parent
function updateSkillStates() {
  skills.forEach(skill => {
    const parentId = skill.dataset.parent;
    const cost = parseInt(skill.dataset.cost);
    const isUnlocked = skill.classList.contains('unlocked');
    const parentUnlocked = !parentId || document.getElementById(parentId)?.classList.contains('unlocked');
    const canAfford = skillPoints >= cost;

    let prereqText = '';
    const requirements = skill.dataset.requirements?.split(',').filter(Boolean) || [];
    if (!isUnlocked && requirements.length > 0) {
      const metCount = requirements.filter(id => document.getElementById(id)?.classList.contains('unlocked')).length;
      const color = metCount === requirements.length ? 'limegreen' : 'red';
      prereqText = `<br><span style="color:${color}; font-size: 1.0em;">Conditions: ${metCount}/${requirements.length}</span>`;
    }

    if (isUnlocked) {
      skill.innerHTML = `${skill.dataset.name}<br><span style="color: lime;">Unlocked</span>`;
    } else if (parentUnlocked) {
      skill.classList.remove('disabled');
      const color = canAfford ? 'yellow' : 'red';
      skill.innerHTML = `${skill.dataset.name}<br><span style="color: ${color};">Cost: ${cost}</span>${prereqText}`;
    } else {
      skill.classList.add('disabled');
      skill.innerHTML = `${skill.dataset.name}<br><span style="color: white;">Cost: ${cost}</span>`;
    }
  });
}





// Unlock button
unlockBtn.addEventListener('click', () => {
  if (!currentSkill) return;

  const cost = parseInt(currentSkill.dataset.cost);
  const parentId = currentSkill.dataset.parent;
  const requirements = currentSkill.dataset.requirements?.split(',').filter(Boolean) || [];

  // Check requirements
  const unmetRequirements = requirements.filter(reqId => {
    return !document.getElementById(reqId.trim())?.classList.contains('unlocked');
  });

  const parentUnlocked = !parentId || document.getElementById(parentId)?.classList.contains('unlocked');

  if (!parentUnlocked) {
    alert("You must unlock the parent skill first.");
    return;
  }

  if (unmetRequirements.length > 0) {
    const reqNames = unmetRequirements.map(id => {
      const el = document.getElementById(id.trim());
      return el?.dataset.name || id;
    });
    alert(`You must unlock the following first: ${reqNames.join(', ')}`);
    return;
  }

  if (skillPoints >= cost) {
    skillPoints -= cost;
    currentSkill.classList.add('unlocked');
    
    // Apply game effects 
    window.skillEffects.applySkillEffects(currentSkill.id);

    save();
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

// Saving function
function save() {
    const UnlockedSkills = [];
    Array.from(document.getElementsByClassName("skill unlocked")).forEach(skill => {
        UnlockedSkills.push(skill.id);
    });
    fetch('/saveTree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // This header is crucial
        },
        body: JSON.stringify({  // Make sure to stringify
            unlocks: UnlockedSkills,
            modifiers: window.skillEffects.modifiers
        })
    })
    .then(response => {
        if (!response.ok) {
            console.error('Save failed');
        }
        return response.text();
    })
    .then(text => console.log(text))
    .catch(error => console.error('Error:', error));
}

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
  loadUnlockedSkills();
  drawLines();
  updateSkillStates(); // Initialize skill enable/disable state
});


// Close info box if clicking outside of it
document.addEventListener('click', (e) => {
  if (
    interactionLocked &&
    infoBox.style.display === 'block' &&
    !infoBox.contains(e.target) &&
    !e.target.classList.contains('skill')
  ) {
    infoBox.style.display = 'none';
    currentSkill = null;
    interactionLocked = false;
  }
});


