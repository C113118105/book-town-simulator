// 遊戲全域變數
let canvas, ctx;
let gameState = {
  isPaused: false,
  zoom: 1,
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
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  // 綁定事件監聽
  bindEventListeners();

  // 啟動遊戲循環
  gameLoop();

  // 更新 UI
  updateUI();
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
      document.documentElement.requestFullscreen();
    }
  });

  // NPC 列表點擊
  document.addEventListener("click", (e) => {
    if (e.target.closest(".npc-item")) {
      const npcId = e.target.closest(".npc-item").dataset.npcId;
      selectNPC(npcId);
    }
  });

  // 關閉對話按鈕
  document.getElementById("closeDialogue").addEventListener("click", closeDialogue);

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
  window.addEventListener("resize", () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  });
}

// 遊戲主循環
function gameLoop() {
  // 清空畫布
  ctx.fillStyle = "#0a0a0a";
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
  for (let tree of TREES) {
    ctx.fillStyle = tree.color;
    ctx.beginPath();
    ctx.arc(tree.x * 32 + 16, tree.y * 32 + 16, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 繪製建築
function drawBuildings() {
  for (let building of BUILDINGS) {
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

    // 繪製建築名稱
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      building.name,
      building.x * 32 + (building.width * 32) / 2,
      building.y * 32 + (building.height * 32) / 2 + 5
    );
  }
}

// 繪製 NPC
function drawNPCs() {
  for (let npc of NPCS) {
    ctx.fillStyle = npc.color;
    ctx.fillRect(npc.x * 32 + 8, npc.y * 32 + 8, 16, 16);

    // 繪製 NPC 名稱標籤
    ctx.fillStyle = "#fff";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(npc.name, npc.x * 32 + 16, npc.y * 32 - 5);

    // 繪製當前活動
    ctx.fillStyle = "#a0a0a0";
    ctx.font = "9px Arial";
    ctx.fillText(npc.currentActivity, npc.x * 32 + 16, npc.y * 32 - 15);
  }
}

// 繪製玩家（主角）
function drawPlayer() {
  ctx.fillStyle = PLAYER.color;
  ctx.fillRect(PLAYER.x * 32 + 8, PLAYER.y * 32 + 8, 16, 16);

  // 繪製光環效果
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(PLAYER.x * 32 + 16, PLAYER.y * 32 + 16, 12, 0, Math.PI * 2);
  ctx.stroke();

  // 繪製名稱
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(PLAYER.name, PLAYER.x * 32 + 16, PLAYER.y * 32 - 5);
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
    <p><strong>${npc.name}</strong>：${npc.dialogue}</p>
  `;

  // 顯示對話選項（可根據關係等級改變）
  document.getElementById("dialogueOption1").textContent = "👋 打招呼";
  document.getElementById("dialogueOption1").style.display = "inline-block";
  document.getElementById("dialogueOption1").onclick = () => {
    respondToDialogue("打招呼", npc);
  };

  document.getElementById("dialogueOption2").textContent = "🛍️ 推薦書籍";
  document.getElementById("dialogueOption2").style.display = "inline-block";
  document.getElementById("dialogueOption2").onclick = () => {
    respondToDialogue("推薦書籍", npc);
  };
}

// 回應對話
function respondToDialogue(response, npc) {
  document.getElementById("dialogueContent").innerHTML = `
    <p><strong>你</strong>：${response}</p>
    <p><strong>${npc.name}</strong>：很高興見到你！希望下次還能看到你。</p>
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
    "<p>歡迎來到墨色書街。點擊地圖上的 NPC 進行互動。</p>";

  document.getElementById("dialogueOption1").style.display = "none";
  document.getElementById("dialogueOption2").style.display = "none";
}

// 進入建築
function enterBuilding(building) {
  const interiorView = document.getElementById("interiorView");
  const interiorContent = document.getElementById("interiorContent");

  interiorContent.innerHTML = `
    <h2>${building.name}</h2>
    <p>${building.description}</p>
    <p style="margin-top: 20px; font-size: 14px;">（此功能開發中）</p>
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
  // 更新時間
  const now = WORLD_CONFIG.currentTime;
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("timeDisplay").textContent = `${hours}:${minutes}`;

  // 更新天氣
  document.getElementById("weatherDisplay").textContent = "☀️ 晴天";

  // 更新季節
  document.getElementById("seasonDisplay").textContent = "🌸 春季";

  // 更新 NPC 列表
  updateNPCList();

  // 更新玩家狀態
  updatePlayerStatus();

  // 每秒更新一次
  setInterval(() => {
    WORLD_CONFIG.currentTime.setSeconds(
      WORLD_CONFIG.currentTime.getSeconds() + 1
    );
    updateUI();
  }, 1000 / WORLD_CONFIG.timeScale);
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
      <div class="npc-name">${npc.name}</div>
      <div class="npc-activity">${npc.currentActivity}</div>
    `;

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
