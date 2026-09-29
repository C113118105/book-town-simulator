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

// 初始化遊戲
function initGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  // 設置 Canvas 大小
  resizeCanvas();

  // 綁定事件監聽
  bindEventListeners();

  // 啟動遊戲循環
  gameLoop();

  // 更新 UI
  updateUI();
}

// 重新調整 Canvas 大小
function resizeCanvas() {
  const gameArea = document.querySelector(".game-area");
  canvas.width = gameArea.clientWidth - 520; // 扣除左右面板寬度
  canvas.height = gameArea.clientHeight;
}

// 綁定事件監聽
function bindEventListeners() {
  // 縮放按鈕
  document.getElementById("zoomInBtn").addEventListener("click", () => {
    gameState.zoom = Math.min(gameState.zoom + 0.2, 3);
  });

  document.getElementById("zoomOutBtn").addEventListener("click", () => {
    gameState.zoom = Math.max(gameState.zoom - 0.2, 0.5);
  });

  // 全螢幕按鈕
  document.getElementById("fullscreenBtn").addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(err => {
        console.log("全螢幕請求被拒絕:", err);
      });
    }
  });

  // 標籤頁切換
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      switchTab(e.target.dataset.tab);
    });
  });

  // Canvas 點擊事件
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / gameState.zoom + gameState.cameraX;
    const y = (e.clientY - rect.top) / gameState.zoom + gameState.cameraY;

    // 檢查是否點擊到 NPC
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

    // 檢查是否點擊到建築
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

  // 視窗大小改變時重新調整 Canvas
  window.addEventListener("resize", resizeCanvas);

  // 關閉對話按鈕
  document.getElementById("closeDialogue").addEventListener("click", closeDialogue);
}

// 遊戲主循環
function gameLoop() {
  // 清空畫布
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 應用縮放與相機
  ctx.save();
  ctx.scale(gameState.zoom, gameState.zoom);
  ctx.translate(-gameState.cameraX, -gameState.cameraY);

  // 繪製世界
  drawTerrain();
  drawTrees();
  drawBuildings();
  drawNPCs();
  drawPlayer();

  ctx.restore();

  // 遞迴調用
  requestAnimationFrame(gameLoop);
}

// 繪製地形
function drawTerrain() {
  for (let terrain of TERRAIN) {
    ctx.fillStyle = terrain.color;
    ctx.fillRect(
      terrain.x * 32,
      terrain.y * 32,
      terrain.width * 32,
      terrain.height * 32
    );
  }
}

// 繪製樹木
function drawTrees() {
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  for (let tree of TREES) {
    ctx.fillText("🌳", tree.x * 32 + 16, tree.y * 32 + 16);
  }
}

// 繪製建築
function drawBuildings() {
  for (let building of BUILDINGS) {
    // 繪製建築背景
    ctx.fillStyle = building.color;
    ctx.fillRect(
      building.x * 32,
      building.y * 32,
      building.width * 32,
      building.height * 32
    );

    // 繪製邊框
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      building.x * 32,
      building.y * 32,
      building.width * 32,
      building.height * 32
    );

    // 繪製建築 emoji 圖標
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    
    const emoji = building.id === "bookstore" ? "📚" : (building.id === "cafe" ? "☕" : "📖");
    ctx.fillText(
      emoji,
      building.x * 32 + (building.width * 32) / 2,
      building.y * 32 + (building.height * 32) / 2 - 10
    );

    // 繪製建築名稱
    ctx.font = "bold 12px Arial";
    ctx.fillStyle = "#ffd700";
    ctx.fillText(
      building.name,
      building.x * 32 + (building.width * 32) / 2,
      building.y * 32 + (building.height * 32) / 2 + 15
    );
  }
}

// 繪製 NPC
function drawNPCs() {
  for (let npc of NPCS) {
    // 繪製 NPC 名稱背景
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(npc.x * 32 - 5, npc.y * 32 - 20, 40, 16);

    // NPC 名稱
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(npc.name, npc.x * 32 + 16, npc.y * 32 - 12);

    // 繪製 NPC emoji 圖標
    ctx.font = "24px Arial";
    ctx.fillText(npc.emoji, npc.x * 32 + 16, npc.y * 32 + 16);

    // 當前活動標籤
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(npc.x * 32 - 10, npc.y * 32 + 22, 60, 14);
    
    ctx.fillStyle = "#a0a0a0";
    ctx.font = "9px Arial";
    ctx.fillText(npc.currentActivity, npc.x * 32 + 16, npc.y * 32 + 29);
  }
}

// 繪製玩家（主角）
function drawPlayer() {
  // 玩家光環
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(PLAYER.x * 32 + 16, PLAYER.y * 32 + 16, 18, 0, Math.PI * 2);
  ctx.stroke();

  // 玩家 emoji 圖標
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(PLAYER.emoji, PLAYER.x * 32 + 16, PLAYER.y * 32 + 16);

  // 玩家名稱
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 12px Arial";
  ctx.textBaseline = "bottom";
  ctx.fillText(PLAYER.name, PLAYER.x * 32 + 16, PLAYER.y * 32 - 10);

  // HP/狀態指示
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(PLAYER.x * 32 + 2, PLAYER.y * 32 + 24, 28, 6);
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(PLAYER.x * 32 + 2, PLAYER.y * 32 + 24, (PLAYER.energy / 100) * 28, 6);
}

// 選擇 NPC
function selectNPC(npcId) {
  gameState.selectedNPC = npcId;

  // 更新 NPC 列表視覺效果
  document.querySelectorAll(".npc-item").forEach((item) => {
    item.classList.remove("selected");
  });

  const selectedItem = document.querySelector(`[data-npc-id="${npcId}"]`);
  if (selectedItem) {
    selectedItem.classList.add("selected");
  }
}

// 開始對話
function startDialogue(npc) {
  gameState.inDialogue = true;
  gameState.currentDialogue = npc;

  document.getElementById("dialogueContent").innerHTML = `
    <p><strong>${npc.emoji} ${npc.name}</strong>：${npc.dialogue}</p>
  `;

  // 顯示對話選項
  const opt1 = document.getElementById("dialogueOption1");
  const opt2 = document.getElementById("dialogueOption2");

  opt1.textContent = "👋 打招呼";
  opt1.style.display = "inline-block";
  opt1.onclick = () => respondToDialogue("打招呼", npc);

  opt2.textContent = "🛍️ 推薦書籍";
  opt2.style.display = "inline-block";
  opt2.onclick = () => respondToDialogue("推薦書籍", npc);
}

// 回應對話
function respondToDialogue(response, npc) {
  document.getElementById("dialogueContent").innerHTML = `
    <p><strong>你</strong>：${response}</p>
    <p><strong>${npc.emoji} ${npc.name}</strong>：很高興見到你！希望下次還能看到你。</p>
  `;

  document.getElementById("dialogueOption1").style.display = "none";
  document.getElementById("dialogueOption2").style.display = "none";

  // 增加關係等級
  npc.relationshipLevel = Math.min(npc.relationshipLevel + 3, 100);
}

// 關閉對話
function closeDialogue() {
  gameState.inDialogue = false;
  gameState.currentDialogue = null;

  document.getElementById("dialogueContent").innerHTML =
    "<p>歡迎來到墨色書街。點擊地圖上的 NPC 或建築物進行互動。</p>";

  document.getElementById("dialogueOption1").style.display = "none";
  document.getElementById("dialogueOption2").style.display = "none";
}

// 進入建築
function enterBuilding(building) {
  const interiorView = document.getElementById("interiorView");
  const interiorContent = document.getElementById("interiorContent");

  const buildingEmoji = building.id === "bookstore" ? "📚" : (building.id === "cafe" ? "☕" : "📖");

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

// 切換標籤頁
function switchTab(tabName) {
  // 隱藏所有標籤內容
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // 移除所有按鈕的 active 類
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // 顯示選中的標籤
  const tabId = `${tabName}Tab`;
  const tabElement = document.getElementById(tabId);
  if (tabElement) {
    tabElement.classList.add("active");
  }

  // 標記按鈕為 active
  event.target.classList.add("active");
}

// 更新 UI
function updateUI() {
  // 立即更新一次
  updateTimeAndWeather();
  updateNPCList();
  updatePlayerStatus();

  // 每秒更新一次
  setInterval(() => {
    updateTimeAndWeather();
    updateNPCList();
    updatePlayerStatus();
  }, 1000);
}

// 更新時間和天氣
function updateTimeAndWeather() {
  const now = WORLD_CONFIG.currentTime;
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("timeDisplay").textContent = `${hours}:${minutes}`;

  // 每秒加 60 秒（時間加速）
  WORLD_CONFIG.currentTime.setSeconds(WORLD_CONFIG.currentTime.getSeconds() + 60);
}

// 更新 NPC 列表
function updateNPCList() {
  const npcList = document.getElementById("npcList");
  npcList.innerHTML = "";

  for (let npc of NPCS) {
    const npcItem = document.createElement("div");
    npcItem.className = "npc-item";
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

// 更新玩家狀態
function updatePlayerStatus() {
  document.getElementById("energyBar").style.width = PLAYER.energy + "%";
  document.getElementById("hungerBar").style.width = PLAYER.hunger + "%";
  document.getElementById("socialBar").style.width = PLAYER.social + "%";
  document.getElementById("stressBar").style.width = PLAYER.stress + "%";
  document.getElementById("inspirationBar").style.width = PLAYER.inspiration + "%";

  document.getElementById("moodDisplay").innerHTML =
    `<strong>心情：</strong>${PLAYER.mood}`;
  document.getElementById("activityDisplay").innerHTML =
    `<strong>活動：</strong>${PLAYER.currentActivity}`;
  document.getElementById("locationDisplay").innerHTML =
    `<strong>位置：</strong>${PLAYER.currentLocation}`;
}

// 啟動遊戲
window.addEventListener("DOMContentLoaded", initGame);
