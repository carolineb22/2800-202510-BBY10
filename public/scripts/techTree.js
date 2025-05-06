const skills = document.querySelectorAll('.skill');
const canvas = document.getElementById('connectorCanvas');
const ctx = canvas.getContext('2d');

let skillPoints = 0;
const skillPointsDisplay = document.getElementById('skillPoints');
const addPointBtn = document.getElementById('addPointBtn');

const infoBox = document.getElementById('infoBox');
const infoTitle = document.getElementById('infoTitle');
const infoCost = document.getElementById('infoCost');
const infoDescription = document.getElementById('infoDescription');
const unlockBtn = document.getElementById('unlockBtn');
const cancelBtn = document.getElementById('cancelBtn');

let currentSkill = null;  // Track the currently selected skill

// Update the skill points display
addPointBtn.addEventListener('click', () => {
  skillPoints++;
  updateSkillPointsDisplay();
});

function updateSkillPointsDisplay() {
  skillPointsDisplay.textContent = `Skill Points: ${skillPoints}`;
}

// Draw connecting lines between skills
function drawLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  skills.forEach(skill => {
    const parentId = skill.dataset.parent;
    if (parentId) {
      const parent = document.getElementById(parentId);
      if (parent) {
        const start = getCenter(parent);
        const end = getCenter(skill);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  });
}

// Get the center of an element
function getCenter(elem) {
  const rect = elem.getBoundingClientRect();
  const container = document.getElementById('treeContainer').getBoundingClientRect();
  return {
    x: rect.left - container.left + rect.width / 2,
    y: rect.top - container.top + rect.height / 2
  };
}

// Show the info box with the skill details
function showInfoBox(skill) {
  infoTitle.textContent = skill.dataset.name;
  infoCost.textContent = `Cost: ${skill.dataset.cost} Skill Points`;
  infoDescription.textContent = skill.dataset.description;
  infoBox.style.display = 'block';

  // Position the info box near the clicked skill
  const rect = skill.getBoundingClientRect();
  const container = document.getElementById('treeContainer').getBoundingClientRect();
  infoBox.style.top = rect.top - container.top + rect.height + 10 + 'px';
  infoBox.style.left = rect.left - container.left + rect.width / 2 - 100 + 'px';
}

// Skill unlock logic
skills.forEach(skill => {
    // Dynamically set the text content of the skill box with a line break
    const skillName = skill.dataset.name;
    const skillCost = skill.dataset.cost;
    skill.innerHTML = `${skillName} <br> (Cost: ${skillCost})`;  // Line break between name and cost
  
    skill.addEventListener('click', () => {
      currentSkill = skill; // Set the current skill for unlocking
      showInfoBox(skill);    // Show the info box when a skill is clicked
    });
  });

// Unlock the skill when the Unlock button is clicked
unlockBtn.addEventListener('click', () => {
  if (currentSkill) {
    const cost = parseInt(currentSkill.dataset.cost);

    // Check if parent is unlocked (if it has one)
    const parentId = currentSkill.dataset.parent;
    if (parentId) {
      const parentSkill = document.getElementById(parentId);
      if (!parentSkill.classList.contains('unlocked')) {
        alert("You must unlock the parent skill first.");
        return;
      }
    }

    // Proceed if you have enough skill points
    if (skillPoints >= cost) {
      skillPoints -= cost;
      currentSkill.classList.add('unlocked');
      updateSkillPointsDisplay();
      infoBox.style.display = 'none';
    } else {
      alert("Not enough skill points to unlock this skill.");
    }
  }
});


// Close the info box when Cancel button is clicked
cancelBtn.addEventListener('click', () => {
  infoBox.style.display = 'none';
  currentSkill = null;
});

window.addEventListener('load', drawLines);
window.addEventListener('resize', drawLines);
