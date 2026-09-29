// 世界配置
const WORLD_CONFIG = {
  name: "墨色書街",
  width: 64,
  height: 40,
  tileSize: 32,
  timeScale: 60,
  currentTime: new Date("2026-09-29T13:41:00"),
  weather: "sunny",
  season: "spring"
};

// 地形數據
const TERRAIN = [
  { type: "grass", x: 20, y: 0, width: 44, height: 18, color: "#66bb6a" },
  { type: "dirt_path", x: 0, y: 24, width: 64, height: 5, color: "#a1887f" },
  { type: "flower_garden", x: 47, y: 28, width: 10, height: 8, color: "#ff9800" },
  { type: "grass", x: 18, y: 18, width: 30, height: 16, color: "#66bb6a" },
  { type: "water", x: 2, y: 30, width: 8, height: 10, color: "#4fc3f7" }
];

// 建築物數據
const BUILDINGS = [
  {
    id: "bookstore",
    name: "墨頁書店",
    x: 24,
    y: 15,
    width: 17,
    height: 13,
    color: "#d4a574",
    interior: true,
    description: "林天墨經營的獨立書店"
  },
  {
    id: "cafe",
    name: "王老闆咖啡館",
    x: 7,
    y: 14,
    width: 10,
    height: 9,
    color: "#8b6f47",
    interior: true,
    description: "30年歷史的老咖啡館"
  },
  {
    id: "library",
    name: "城鎮圖書館",
    x: 3,
    y: 3,
    width: 12,
    height: 9,
    color: "#5d4e37",
    interior: true,
    description: "陳詩雨常去的地方"
  }
];

// 主角配置
const PLAYER = {
  id: "agent_lintianmo",
  name: "林天墨",
  age: 34,
  x: 32,
  y: 22,
  width: 1,
  height: 1,
  color: "#2c3e50",
  direction: "down",
  energy: 82,
  hunger: 45,
  social: 68,
  stress: 22,
  inspiration: 76,
  mood: "平靜而專注",
  currentLocation: "bookstore_first_floor",
  currentActivity: "接待顧客"
};

// NPC 配置
const NPCS = [
  {
    id: "npc_chenshi_yu",
    name: "陳詩雨",
    x: 5,
    y: 5,
    color: "#e91e63",
    role: "大學藝術教授",
    currentLocation: "library",
    currentActivity: "準備課程",
    relationshipLevel: 72,
    dialogue: "你好，我在整理藝術書籍。最近有什麼推薦嗎？"
  },
  {
    id: "npc_wang",
    name: "王老闆",
    x: 12,
    y: 18,
    color: "#ff9800",
    role: "咖啡館老闆",
    currentLocation: "cafe",
    currentActivity: "經營咖啡館",
    relationshipLevel: 81,
    dialogue: "天墨！要不要來杯咖啡？我剛煮的衣索比亞豆。"
  },
  {
    id: "npc_xiaoli",
    name: "小李",
    x: 30,
    y: 20,
    color: "#2196f3",
    role: "書店兼職員工",
    currentLocation: "bookstore_first_floor",
    currentActivity: "整理書架",
    relationshipLevel: 64,
    dialogue: "天墨老闆，新書到了！要我幫忙上架嗎？"
  }
];

// 樹木與裝飾
const TREES = [
  { x: 25, y: 2, color: "#4caf50" },
  { x: 30, y: 3, color: "#4caf50" },
  { x: 35, y: 2, color: "#4caf50" },
  { x: 40, y: 4, color: "#4caf50" },
  { x: 45, y: 3, color: "#4caf50" },
  { x: 50, y: 2, color: "#4caf50" },
  { x: 55, y: 3, color: "#4caf50" },
  { x: 52, y: 10, color: "#4caf50" },
  { x: 57, y: 12, color: "#4caf50" },
  { x: 48, y: 15, color: "#4caf50" },
  { x: 54, y: 8, color: "#4caf50" }
];

// 任務配置
const QUESTS = [
  {
    id: "quest_001",
    title: "尋找母親的藏書",
    description: "林天墨得知��親生前收藏的一本絕版書可能藏在回聲森林附近的舊屋中。",
    progress: 25,
    steps: [
      "詢問王老闆",
      "前往圖書館查找資料",
      "探索回聲森林",
      "找回母親的藏書"
    ],
    completedSteps: 1
  }
];

// 記憶配置
const MEMORIES = [
  {
    id: "memory_001",
    title: "母親的最後一本書",
    content: "高中時母親送給天墨一本《挪威的森林》，在她去世前夜，她握著天墨的手說：『書裡有我想對你說的話』",
    emotion: "懷念",
    importance: 1.0
  },
  {
    id: "memory_002",
    title: "雨夜收養墨墨",
    content: "三年前在書店外的雨中救了一隻受傷的貓咪，後來收養了它，取名『墨墨』",
    emotion: "溫暖",
    importance: 0.8
  },
  {
    id: "memory_003",
    title: "顧客的感謝信",
    content: "一名憂鬱症患者感謝信，說書店和天墨的推薦拯救了他的生命",
    emotion: "驕傲",
    importance: 0.9
  }
];

// 日常作息
const DAILY_ROUTINE = [
  { time: "06:00", location: "bookstore_second_floor", activity: "冥想與寫日記" },
  { time: "07:00", location: "bookstore", activity: "準備早餐並整理環境" },
  { time: "08:30", location: "bookstore_first_floor", activity: "整理書籍與接待常客" },
  { time: "12:00", location: "bookstore_second_floor", activity: "午餐與閱讀" },
  { time: "13:30", location: "bookstore_first_floor", activity: "推薦書籍與處理店務" },
  { time: "18:00", location: "main_road", activity: "散步並前往咖啡館" },
  { time: "19:30", location: "bookstore_second_floor", activity: "寫作、閱讀與管理線上書評" }
];

// 導出配置
export {
  WORLD_CONFIG,
  TERRAIN,
  BUILDINGS,
  PLAYER,
  NPCS,
  TREES,
  QUESTS,
  MEMORIES,
  DAILY_ROUTINE
};
