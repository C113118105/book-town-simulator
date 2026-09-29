// 遊戲全域變數
let canvas, ctx;
let gameState = {
  isPaused: false,
  zoom: 1.5,
  cameraX: 0,
  cameraY: 0,
  selectedNPC: null,
  inDialogue: false,
  currentDialogue: null
};

// 離屏 Canvas 快取（儲存像素貼圖）
const sprites = {};

// 初始化遊戲
function initGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  // 生成像素貼圖（草地、樹木、角色等）
  generatePixelSprites();

  resizeCanvas();
  bindEventListeners();

  requestAnimationFrame(gameLoop);
  initUIUpdateLoop();
}

// 產生像素風格貼圖（免加載外部分頁圖片，純 Canvas 程式繪製）
function generatePixelSprites() {
  const createSprite = (width, height, drawFn) => {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext("2d");
    offCtx.imageSmoothingEnabled = false;
    drawFn(offCtx);
    return offCanvas;
  };

  // 1. 草地地磚 (32x32)
  sprites.grass = createSprite(32, 32, (c) => {
    c.fillStyle = "#4a8505";
    c.fillRect(0, 0, 32, 32);
    c.fillStyle = "#3b6a04";
    for (let i = 0; i < 16; i += 4) {
      c.fillRect(i * 2, (i * 3) % 32, 2, 2);
    }
  });

  // 2. 像素樹木 (32x32)
  sprites.tree = createSprite(32, 32, (c) => {
    // 樹幹
    c.fillStyle = "#5a3d28";
    c.fillRect(12, 20, 8, 12);
    // 樹葉
    c.fillStyle = "#2d681f";
    c.fillRect(6, 4, 20, 18);
    c.fillStyle = "#388427";
    c.fillRect(8, 2, 16, 16);
  });

  // 3. 像素玩家/NPC (16x16 放大至 32x32)
  sprites.player = createSprite(32, 32, (c) => {
    // 頭部
    c.fillStyle = "#f3a583";
    c.fillRect(8, 4, 16, 12);
    // 眼睛
    c.fillStyle = "#000";
    c.fillRect(12, 8, 2, 4);
    c.fillRect(18, 8, 2, 4);
    // 衣服
    c.fillStyle = "#2c3e50";
    c.fillRect(6, 16, 20, 12);
  });
}

// 重新調整 Canvas 大小
function resizeCanvas() {
  const gameArea = document.querySelector(".game-area");
  if (gameArea) {
    canvas.width = gameArea.clientWidth - 520;
    canvas.height = gameArea.clientHeight;
  }
}

// 座標轉換輔助函式
function getCanvasWorldPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / gameState.zoom + gameState.cameraX,
    y: (e.clientY - rect.top) / gameState.zoom + gameState.cameraY
  };
}

// 綁定事件監聽
function bindEventListeners() {
  document.getElementById("zoomInBtn")?.addEventListener("click", () => {
    gameState.zoom = Math.min(gameState.zoom + 0.2, 3);
  });

  document.getElementById("zoomOutBtn")?.addEventListener("click", () => {
    gameState.zoom = Math.max(gameState.zoom - 0.2, 0.5);
  });

  document.getElementById("fullscreenBtn")?.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("全螢幕請求被拒絕:", err);
      });
    }
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      switchTab(e.currentTarget, e.currentTarget.dataset.tab);
    });
  });

  canvas.addEventListener("click", (e) => {
    const { x, y } = getCanvasWorldPos(e);

    // 檢查 NPC 點擊
    for (let npc of NPCS) {
      if (
        x >= npc.x * 32 &&
        x < (npc.x + 1) * 32 &&
        y >= npc.y * 32 &&
        y < (npc.y + 1) * 32
      ) {
        selectNPC(npc.id);
        startDialogue(npc);
        return;
      }
    }

    // 檢查建築點擊
    for (let building of BUILDINGS) {
      if (
        x >= building.x * 32 &&
        x < (building.x + building.width) * 32 &&
        y >= building.y * 32 &&
        y < (building.y + building.height) * 32
      ) {
        enterBuilding(building);
        return;
      }
    }
  });

  window.addEventListener("resize", resizeCanvas);
  document.getElementById("closeDialogue")?.addEventListener("click", closeDialogue);
}

// 遊戲主循環
function gameLoop() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 關閉點陣圖平滑，保持清晰的像素邊緣 (Pixel-art crispness)
  ctx.imageSmoothingEnabled = false;

  ctx.save();
  ctx.scale(gameState.zoom, gameState.zoom);
  ctx.translate(-gameState.cameraX, -gameState.cameraY);

  drawTerrain();
  drawTrees();
  drawBuildings();
  drawNPCs();
  drawPlayer();

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

// 繪製像素地形
function drawTerrain() {
  for (let terrain of TERRAIN) {
    for (let w = 0; w < terrain.width; w++) {
      for (let h = 0; h < terrain.height; h++) {
        ctx.drawImage(
          sprites.grass,
          (terrain.x + w) * 32,
          (terrain.y + h) * 32,
          32,
          32
        );
      }
    }
  }
}

// 繪製像素樹木
function drawTrees() {
  for (let tree of TREES) {
    ctx.drawImage(sprites.tree, tree.x * 32, tree.y * 32, 32, 32);
  }
}

// 繪製像素風格建築物
function drawBuildings() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let building of BUILDINGS) {
    const bx = building.x * 32;
    const by = building.y * 32;
    const bw = building.width * 32;
    const bh = building.height * 32;

    // 牆體像素顏色
    ctx.fillStyle = building.color || "#8b5a2b";
    ctx.fillRect(bx, by, bw, bh);

    // 像素粗邊框
    ctx.fillStyle = "#2c1d11";
    ctx.fillRect(bx, by, bw, 4); // 上
    ctx.fillRect(bx, by + bh - 4, bw, 4); // 下
    ctx.fillRect(bx, by, 4, bh); // 左
    ctx.fillRect(bx + bw - 4, by, 4, bh); // 右

    // 門口像素繪製
    ctx.fillStyle = "#3d2612";
    ctx.fillRect(bx + bw / 2 - 8, by + bh - 16, 16, 16);

    // 建築名稱標籤
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#ffd700";
    ctx.fillText(building.name, bx + bw / 2, by + bh / 2);
  }
}

// 繪製像素 NPC
function drawNPCs() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let npc of NPCS) {
    const nx = npc.x * 32;
    const ny = npc.y * 32;

    // 繪製像素角色貼圖
    ctx.drawImage(sprites.player, nx, ny, 32, 32);

    // NPC 姓名標籤
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(nx - 8, ny - 20, 48, 14);

    ctx.fillStyle = "#ffd700";
    ctx.font = "10px monospace";
    ctx.fillText(npc.name, nx + 16, ny - 13);
  }
}

// 繪製像素主角
function drawPlayer() {
  const px = PLAYER.x * 32;
  const py = PLAYER.y * 32;

  // 像素角色貼圖
  ctx.drawImage(sprites.player, px, py, 32, 32);

  // 主角金黃色像素光環
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 2;
  ctx.strokeRect(px - 2, py - 2, 36, 36);

  // 玩家名稱標籤
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(px - 10, py - 20, 52, 14);

  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(PLAYER.name, px + 16, py - 13);
}

function selectNPC(npcId) {
  gameState.selectedNPC = npcId;
  document.querySelectorAll(".npc-item").forEach((item) => item.classList.remove("selected"));

  const selectedItem = document.querySelector(`[data-npc-id="${npcId}"]`);
  selectedItem?.classList.add("selected");
}

function startDialogue(npc) {
  gameState.inDialogue = true;
  gameState.currentDialogue = npc;

  document.getElementById("dialogueContent").innerHTML = `
    <p><strong>${npc.emoji} ${npc.name}</strong>：${npc.dialogue}</p>
  `;

  const opt1 = document.getElementById("dialogueOption1");
  const opt2 = document.getElementById("dialogueOption2");

  if (opt1) {
    opt1.textContent = "👋 打招呼";
    opt1.style.display = "inline-block";
    opt1.onclick = () => respondToDialogue("打招呼", npc);
  }

  if (opt2) {
    opt2.textContent = "🛍️ 推薦書籍";
    opt2.style.display = "inline-block";
    opt2.onclick = () => respondToDialogue("推薦書籍", npc);
  }
}

function respondToDialogue(response, npc) {
  document.getElementById("dialogueContent").innerHTML = `
    <p><strong>你</strong>：${response}</p>
    <p><strong>${npc.emoji} ${npc.name}</strong>：很高興見到你！希望下次還能看到你。</p>
  `;

  document.getElementById("dialogueOption1").style.display = "none";
  document.getElementById("dialogueOption2").style.display = "none";

  npc.relationshipLevel = Math.min(npc.relationshipLevel + 3, 100);
  updateNPCList();
}

function closeDialogue() {
  gameState.inDialogue = false;
  gameState.currentDialogue = null;

  document.getElementById("dialogueContent").innerHTML =
    "<p>歡迎來到墨色書街。點擊地圖上的 NPC 或建築物進行互動。</p>";

  document.getElementById("dialogueOption1").style.display = "none";
  document.getElementById("dialogueOption2").style.display = "none";
}

function enterBuilding(building) {
  const interiorView = document.getElementById("interiorView");
  const interiorContent = document.getElementById("interiorContent");
  const buildingEmoji = building.id === "bookstore" ? "📚" : building.id === "cafe" ? "☕" : "📖";

  interiorContent.innerHTML = `
    <h2>${buildingEmoji} ${building.name}</h2>
    <p>${building.description}</p>
    <p style="margin-top: 20px; font-size: 14px; color: #888;">（此功能開發中）</p>
  `;

  interiorView.style.display = "flex";
  document.getElementById("exitInterior").onclick = () => {
    interiorView.style.display = "none";
  };
}

function switchTab(clickedBtn, tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));

  const tabElement = document.getElementById(`${tabName}Tab`);
  if (tabElement) tabElement.classList.add("active");

  clickedBtn.classList.add("active");
}

function initUIUpdateLoop() {
  updateAllUI();
  setInterval(updateAllUI, 1000);
}

function updateAllUI() {
  updateTimeAndWeather();
  updateNPCList();
  updatePlayerStatus();
}

function updateTimeAndWeather() {
  const now = WORLD_CONFIG.currentTime;
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("timeDisplay").textContent = `${hours}:${minutes}`;

  WORLD_CONFIG.currentTime.setSeconds(WORLD_CONFIG.currentTime.getSeconds() + 60);
}

function updateNPCList() {
  const npcList = document.getElementById("npcList");
  if (!npcList) return;

  npcList.innerHTML = "";

  for (let npc of NPCS) {
    const npcItem = document.createElement("div");
    npcItem.className = `npc-item ${gameState.selectedNPC === npc.id ? "selected" : ""}`;
    npcItem.dataset.npcId = npc.id;
    npcItem.innerHTML = `
      <div class="npc-name">${npc.emoji} ${npc.name}</div>
      <div class="npc-activity">${npc.currentActivity}</div>
      <div style="font-size: 10px; color: #888; margin-top: 3px;">好感度: ${npc.relationshipLevel}</div>
    `;

    npcItem.addEventListener("click", () => {
      selectNPC(npc.id);
      startDialogue(npc);
    });

    npcList.appendChild(npcItem);
  }
}

function updatePlayerStatus() {
  document.getElementById("energyBar").style.width = PLAYER.energy + "%";
  document.getElementById("hungerBar").style.width = PLAYER.hunger + "%";
  document.getElementById("socialBar").style.width = PLAYER.social + "%";
  document.getElementById("stressBar").style.width = PLAYER.stress + "%";
  document.getElementById("inspirationBar").style.width = PLAYER.inspiration + "%";

  document.getElementById("moodDisplay").innerHTML = `<strong>心情：</strong>${PLAYER.mood}`;
  document.getElementById("activityDisplay").innerHTML = `<strong>活動：</strong>${PLAYER.currentActivity}`;
  document.getElementById("locationDisplay").innerHTML = `<strong>位置：</strong>${PLAYER.currentLocation}`;
}

window.addEventListener("DOMContentLoaded", initGame);
