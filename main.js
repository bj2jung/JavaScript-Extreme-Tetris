const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20, 20);

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (y = 0; y < m.length; y++) {
    for (x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

let comboBonus = 0;
let comboCount = 0;

function arenaSweep() {
  let checkCombo = false;
  let multipleLineBonus = 0;
  outer: for (y = arena.length - 1; y >= 0; y--) {
    for (x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    arena.unshift(arena.splice(y, 1)[0].fill(0));
    y++;
    multipleLineBonus += 10;
    player.score += 10;
    dropInterval += 10;
    checkCombo = true;
  }

  if (checkCombo) {
    comboCount += 1;
    comboBonus = comboCount * 10;
    if (comboCount > 0) {
      comboBonus -= 10;
    }
  } else {
    comboCount = 0;
    comboBonus = 0;
  }
  multipleLineBonus === 0 ? 0 : (multipleLineBonus -= 10);
  updateScore(player.score + comboBonus + multipleLineBonus);
  updateSpeed(dropInterval);

  comboBonus || multipleLineBonus
    ? addBonusAnimation("bonusPointsPopup", comboBonus + multipleLineBonus)
    : null;
  checkCombo ? addBonusAnimation("decreasedSpeedPopup") : null;
}

function createPiece(type) {
  if (type == "T") {
    return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
  } else if (type == "O") {
    return [[2, 2], [2, 2]];
  } else if (type == "L") {
    return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
  } else if (type == "J") {
    return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
  } else if (type == "I") {
    return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
  } else if (type == "S") {
    return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
  } else if (type == "Z") {
    return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
  }
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function updateScore(score) {
  document.getElementById("score").innerText = "Score: " + score;
  player.score = score;
}

function updateBonusPointsText(points, elementToAnimate) {
  elementToAnimate.innerText = "Bonus +" + points;
}

function updateSpeed(speed) {
  document.getElementById("speed").innerText = "Speed: " + speed;
}

function addBonusAnimation(element, points) {
  let elementToAnimate = document.getElementById(element);
  elementToAnimate.classList.remove("activateAnimation");
  void elementToAnimate.offsetWidth;

  element == "bonusPointsPopup"
    ? updateBonusPointsText(points, elementToAnimate)
    : null;

  elementToAnimate.classList.add("activateAnimation");
  setTimeout(function() {
    elementToAnimate.classList.remove("activateAnimation");
  }, 1500);
}

function draw() {
  context.fillStyle = "#999999";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, 0, 0);
  drawMatrixShadow(player.matrix, player.pos.x, shadowPlayer.pos.y);
  drawMatrix(player.matrix, player.pos.x, player.pos.y);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
  arenaSweep();
}

function playerDrop() {
  player.pos.y++;
  dropCounter = 0;

  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    if (collide(arena, player)) {
      resetArena();
    }
  }
}

function playerDropAllTheWay() {
  while (!collide(arena, player)) {
    player.pos.y++;
  }
  player.pos.y--;
  merge(arena, player);
  playerReset();
  if (collide(arena, player)) {
    resetArena();
  }
}

function resetArena() {
  arena.forEach(row => row.fill(0));
  updateScore(0);
}

function playerMove(direction) {
  player.pos.x += direction;
  if (collide(arena, player)) {
    player.pos.x -= direction;
  }
}

function rotate(matrix) {
  for (y = 0; y < matrix.length; y++) {
    for (x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  matrix.reverse();

  if (collide(arena, player)) {
    let xOffset = 1;
    while (collide(arena, player) && xOffset < 5) {
      player.pos.x += xOffset * (xOffset % 2 == 1 ? 1 : -1);
      xOffset++;
    }
    if (collide(arena, player)) {
      let yOffset = 1;
      while (collide(arena, player)) {
        player.pos.y -= yOffset;
        yOffset++;
      }
    }
  }
}

let pieces = "TOLJISZ";

function playerReset() {
  player.matrix = createPiece(pieces[Math.floor(Math.random() * 7)]);
  player.pos.y = 0;
  player.pos.x = 4;
}

function reduceDropInterval() {
  dropSpeedCounter = 0;
  if (dropInterval >= 200) {
    dropInterval -= 30;
  } else if (dropInterval >= 100) {
    dropInterval -= 15;
  } else if (dropInterval >= 50) {
    dropInterval -= 5;
  } else if (dropInterval >= 35) {
    dropInterval -= 2.5;
  }
  updateSpeed(dropInterval);
}

let dropCounter = 0;
let lastTimeForDrop = 0;
// let dropInterval = 350;
let dropInterval = 35000;
let dropSpeedCounter = 0;
let lastTimeForDropSpeed = 0;
// let dropSpeedIncreaseInterval = 5000;
let dropSpeedIncreaseInterval = 500000;

function update(time = 0) {
  const deltaTimeForDrop = time - lastTimeForDrop;
  lastTimeForDrop = time;
  dropCounter += deltaTimeForDrop;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  const deltaTimeForDropSpeed = time - lastTimeForDropSpeed;
  lastTimeForDropSpeed = time;
  dropSpeedCounter += deltaTimeForDropSpeed;

  if (dropSpeedCounter > dropSpeedIncreaseInterval) {
    reduceDropInterval();
  }

  draw();
  updateShadowPlayerOffset();
  requestAnimationFrame(update);
}

let value = null;

const colors = [
  null,
  "#FF0D72",
  "#0DC2FF",
  "#0DFF72",
  "#F538FF",
  "#FF8E0D",
  "#FFE138",
  "#3877FF"
];

function drawMatrix(matrix, offsetX, offsetY) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
    });
  });
}
function drawMatrixShadow(matrix, offsetX, offsetY) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = "grey";
        context.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
    });
  });
}

function updateShadowPlayerOffset() {
  shadowPlayer = Object.assign({
    matrix: player.matrix,
    pos: { x: player.pos.x, y: player.pos.y }
  });
  while (!collide(arena, shadowPlayer)) {
    shadowPlayer.pos.y++;
  }
  shadowPlayer.pos.y--;
}

const arena = createMatrix(12, 25);

const player = {
  matrix: createPiece(pieces[Math.floor(Math.random() * 7)]),
  pos: { x: 4, y: 0 },
  score: 0
};

let shadowPlayer = Object.assign(player);

document.addEventListener("keydown", e => {
  if (e.keyCode === 37) {
    playerMove(-1);
  } else if (e.keyCode === 39) {
    playerMove(1);
  } else if (e.keyCode === 40) {
    playerDrop();
  } else if (e.keyCode === 38) {
    rotate(player.matrix);
  } else if (e.keyCode === 32) {
    playerDropAllTheWay();
  }
});

update();
