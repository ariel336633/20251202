let spriteSheet;
let walkSheet;
let jumpSheet;
let pushSheet;
let toolSheet;
let spriteSheet2;
let smileSheet2;

let stopAnimation = [];
let walkAnimation = [];
let jumpAnimation = [];
let pushAnimation = [];
let toolAnimation = [];
let stopAnimation2 = [];
let smileAnimation2 = [];

const stopNumberOfFrames = 15;
const walkNumberOfFrames = 9;
const jumpNumberOfFrames = 14;
const pushNumberOfFrames = 4;
const toolNumberOfFrames = 5;

const stopNumberOfFrames2 = 8;
const smileNumberOfFrames2 = 5;

let frameWidth;
let walkFrameWidth;

// 角色的位置和速度
let x, y, x2, y2;
let speed = 5;
let direction = 1; // 1 for right, -1 for left
let direction2 = 1; // 1 for right, -1 for left for character 2

// 跳躍相關變數
let isJumping = false;
let velocityY = 0;
let gravity = 0.6;
let jumpStrength = -15; // 負數代表向上
let groundY;

// 角色2 狀態相關變數
let isSmiling2 = false;
let smileFrame2 = 0;
const smileAnimationSpeed2 = 8; // 數字越小越快
const proximityThreshold = 150; // 觸發微笑的距離

// 對話相關變數
let nameInput;
let playerName = '';
let conversationState = 0; // 0: idle, 1: asking, 2: greeted

// 攻擊相關變數
let isAttacking = false;
let attackFrame = 0;
const attackAnimationSpeed = 6; // 數字越小越快

// 發射物陣列
let projectiles = [];

function preload() {
  // 預先載入圖片
  // 請確保您的資料夾結構是 sketch.js 旁邊有 1/stop/stop.png
  spriteSheet = loadImage('1/stop/stop.png');
  walkSheet = loadImage('1/walk/walk.png');
  jumpSheet = loadImage('1/jump/jump.png');
  pushSheet = loadImage('1/push/push.png');
  toolSheet = loadImage('1/tool/tool.png');
  spriteSheet2 = loadImage('2/stop/stop_2.png');
  smileSheet2 = loadImage('2/smile/smile_2.png');
}

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化角色位置在畫面中央
  x = width / 2;
  y = height / 2;
  x2 = width / 2 - 200; // 將新角色放在左邊
  y2 = height / 2;
  groundY = y; // 將初始 y 設為地面高度

  // 計算單一畫格的寬度
  frameWidth = spriteSheet.width / stopNumberOfFrames;
  let frameHeight = spriteSheet.height;
  for (let i = 0; i < stopNumberOfFrames; i++) {
    let frame = spriteSheet.get(i * frameWidth, 0, frameWidth, frameHeight);
    stopAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割走路動畫
  walkFrameWidth = walkSheet.width / walkNumberOfFrames;
  let walkFrameHeight = walkSheet.height;
  for (let i = 0; i < walkNumberOfFrames; i++) {
    let frame = walkSheet.get(
      i * walkFrameWidth, 0, 
      walkFrameWidth, walkFrameHeight
    );
    walkAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割跳躍動畫
  let jumpFrameWidth = jumpSheet.width / jumpNumberOfFrames;
  let jumpFrameHeight = jumpSheet.height;
  for (let i = 0; i < jumpNumberOfFrames; i++) {
    let frame = jumpSheet.get(
      i * jumpFrameWidth, 0,
      jumpFrameWidth, jumpFrameHeight
    );
    jumpAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割攻擊動畫
  let pushFrameWidth = pushSheet.width / pushNumberOfFrames;
  let pushFrameHeight = pushSheet.height;
  for (let i = 0; i < pushNumberOfFrames; i++) {
    let frame = pushSheet.get(
      i * pushFrameWidth, 0,
      pushFrameWidth, pushFrameHeight
    );
    pushAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割發射物動畫
  let toolFrameWidth = toolSheet.width / toolNumberOfFrames;
  let toolFrameHeight = toolSheet.height;
  for (let i = 0; i < toolNumberOfFrames; i++) {
    let frame = toolSheet.get(
      i * toolFrameWidth, 0, toolFrameWidth, toolFrameHeight);
    toolAnimation.push(frame);
  }

  // 計算新角色單一畫格的寬度並切割站立動畫
  let frameWidth2 = spriteSheet2.width / stopNumberOfFrames2;
  let frameHeight2 = spriteSheet2.height;
  for (let i = 0; i < stopNumberOfFrames2; i++) {
    let frame = spriteSheet2.get(i * frameWidth2, 0, frameWidth2, frameHeight2);
    stopAnimation2.push(frame);
  }

  // 計算新角色微笑動畫的畫格
  let smileFrameWidth2 = smileSheet2.width / smileNumberOfFrames2;
  let smileFrameHeight2 = smileSheet2.height;
  for (let i = 0; i < smileNumberOfFrames2; i++) {
    let frame = smileSheet2.get(i * smileFrameWidth2, 0, smileFrameWidth2, smileFrameHeight2);
    smileAnimation2.push(frame);
  }
}

function draw() {
  // 設定背景顏色
  background('#f5ebe0');

  // 將圖片的繪製基準點設為中心
  imageMode(CENTER);

  // --- 物理與狀態更新 ---
  if (isJumping) {
    // 如果在跳躍中，應用重力並更新 y 座標
    velocityY += gravity;
    y += velocityY;

    // 如果角色落回地面
    if (y >= groundY) {
      y = groundY; // 確保角色不會掉到地下
      velocityY = 0;
      isJumping = false; // 結束跳躍
    }
  } else if (isAttacking) {
    // 如果不在跳躍但在攻擊中
    attackFrame++;
    if (attackFrame >= pushNumberOfFrames * attackAnimationSpeed) {
      // 攻擊動畫結束
      isAttacking = false;
      attackFrame = 0;
      // 產生一個發射物
      projectiles.push({
        x: x + (direction * 50), // 從角色前方產生
        y: y,
        direction: direction,
        speed: 40, // 增加發射物速度，使其飛得更遠
        frame: 0
      });
    }
  } else {
    // 如果不在跳躍也不在攻擊，才處理左右移動
    if (keyIsDown(RIGHT_ARROW)) {
      x += speed;
      direction = 1;
    } else if (keyIsDown(LEFT_ARROW)) {
      x -= speed;
      direction = -1;
    }
  }

  // 使用 constrain() 函式將角色的 x 座標限制在畫布範圍內
  let halfW = frameWidth / 2; // Use a general width for constraint
  x = constrain(x, halfW, width - halfW);

  // --- 繪圖 ---

  // 繪製所有發射物
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    p.x += p.speed * p.direction;
    p.frame++;

    push();
    translate(p.x, p.y);
    scale(p.direction, 1);
    let frameIndex = floor(p.frame / 4) % toolNumberOfFrames;
    image(toolAnimation[frameIndex], 0, 0);
    pop();

    // 只在發射物飛出畫面時才移除它
    if (p.x > width || p.x < 0) {
      projectiles.splice(i, 1);
    }
  }

  // 根據角色1的位置決定角色2的方向
  if (x < x2) {
    direction2 = -1; // 角色1在左邊，角色2朝左
  } else {
    direction2 = 1; // 角色1在右邊，角色2朝右
  }

  // --- 對話狀態機 ---
  let isClose = abs(x - x2) < proximityThreshold;

  if (isClose && conversationState === 0) {
    // 靠近時開始對話
    conversationState = 1;
  } else if (!isClose && conversationState !== 0) {
    // 離開時結束對話
    conversationState = 0;
    playerName = '';
    if (nameInput) {
      nameInput.remove();
      nameInput = null;
    }
  }

  // 根據對話狀態決定是否微笑
  if (conversationState > 0) {
    isSmiling2 = true;
  } else {
    isSmiling2 = false;
  }

  // 繪製新角色 (如果動畫已準備好)
  if (stopAnimation2.length > 0) {
    push();
    translate(x2, y2);
    scale(direction2, 1); // 根據方向翻轉角色2

    if (isSmiling2) {
      // 播放微笑動畫
      // 讓動畫循環播放
      image(smileAnimation2[floor(frameCount / smileAnimationSpeed2) % smileNumberOfFrames2], 0, 0);
    } else {
      // 播放站立動畫
      image(stopAnimation2[floor(frameCount / 8) % stopNumberOfFrames2], 0, 0);
    }

    pop();
  }

  // 如果角色2正在微笑，則在其上方顯示對話框
  if (isSmiling2 && smileAnimation2.length > 0) {
    let dialogueText = "";
    if (conversationState === 1) {
      dialogueText = "你叫什麼名字呢?";
      // 如果輸入框不存在，則創建它
      if (!nameInput) {
        nameInput = createInput();
        nameInput.size(150);
      }
      // 持續更新輸入框位置在角色1頭上
      nameInput.position(x - nameInput.width / 2, y - 120);

    } else if (conversationState === 2) {
      dialogueText = playerName + "歡迎您!";
    }

    push();
    // 設定對話框樣式
    let boxWidth = 200;
    let boxHeight = 50;
    // 取得當前微笑圖片的高度來定位對話框
    let smileImgHeight = smileAnimation2[0].height;
    let boxX = x2; // 對話框的X座標
    let boxY = y2 - smileImgHeight / 2 - boxHeight / 2 - 10; // 放在頭頂上方一點

    fill(255, 255, 255, 220); // 半透明白色背景
    stroke(0); // 黑色邊框
    rectMode(CENTER);
    rect(boxX, boxY, boxWidth, boxHeight, 10); // 圓角矩形

    // 設定文字樣式並繪製對話內容
    fill(0); // 黑色文字
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    text(dialogueText, boxX, boxY);
    pop();
  }

  // 繪製角色
  push();
  translate(x, y);
  scale(direction, 1); // 根據方向翻轉圖片

  if (isJumping) {
    // 播放跳躍動畫
    let frameIndex = floor(map(velocityY, jumpStrength, -jumpStrength, 0, jumpNumberOfFrames - 1));
    frameIndex = constrain(frameIndex, 0, jumpNumberOfFrames - 1);
    image(jumpAnimation[frameIndex], 0, 0);
  } else if (isAttacking) {
    // 播放攻擊動畫
    let frameIndex = floor(attackFrame / attackAnimationSpeed);
    image(pushAnimation[frameIndex], 0, 0);
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW)) {
    // 播放走路動畫
    image(walkAnimation[floor(frameCount / 4) % walkNumberOfFrames], 0, 0);
  } else {
    // 播放站立動畫
    image(stopAnimation[floor(frameCount / 8) % stopNumberOfFrames], 0, 0);
  }
  pop();
}

function keyPressed() {
  // 只有在角色不在跳躍或攻擊時才能觸發新動作
  if (isJumping || isAttacking) return;

  if (keyCode === UP_ARROW) {
    isJumping = true;
    velocityY = jumpStrength;
  } else if (keyCode === 32) { // 32 是空白鍵
    isAttacking = true;
    attackFrame = 0;
  } else if (keyCode === ENTER && conversationState === 1) {
    // 當正在詢問時按下 Enter
    playerName = nameInput.value();
    conversationState = 2; // 切換到已打招呼狀態
    nameInput.remove(); // 移除輸入框
    nameInput = null;
  }
}

function windowResized() {
  // 當視窗大小改變時，自動調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
  groundY = height / 2; // 同時更新地面高度
  y2 = height / 2; // 更新新角色的 y 座標
}
