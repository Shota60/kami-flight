class ObstacleManager {
  constructor(canvas, camera, goalY, difficultySettings) {
    this.canvas = canvas;
    this.camera = camera;
    this.goalY = goalY;
    this.obstacles = [];
    this.obstacleSpeed = 0;
    this.obstacleSpawnTimer = 0;
    this.initialObstacleSpawnInterval = difficultySettings.initialObstacleSpawnInterval;
    this.obstacleSpawnInterval = this.initialObstacleSpawnInterval;
    this.minObstacleSpawnInterval = difficultySettings.minimumObstacleSpawnInterval;
    this.wallThickness = this.canvas.width / 18;

    // 障害物タイプの設定をまとめる
    this.obstacleTypes = {
      horizontalWall: {
        weight: 3,
        create: (spawnY) => {
          const maxWidth = this.canvas.width / 6 + (Math.random() * this.canvas.width) / 6;
          return {
            x: this.adjustToThickness((Math.random() * this.canvas.width * 5) / 6),
            y: spawnY,
            width: this.adjustToThickness(maxWidth),
            height: this.wallThickness,
            type: "horizontalWall",
          };
        },
      },
      verticalWall: {
        weight: 1,
        create: (spawnY) => {
          const maxHeight = this.canvas.height / 12 + (Math.random() * this.canvas.height) / 8;
          return {
            x: this.adjustToThickness(Math.random() * (this.canvas.width - this.wallThickness)),
            y: spawnY,
            width: this.wallThickness,
            height: this.adjustToThickness(maxHeight),
            type: "verticalWall",
          };
        },
      },
    };
  }

  // 共通の座標調整関数
  adjustToThickness(value) {
    return Math.round(value / this.wallThickness) * this.wallThickness;
  }

  // 境界計算を統一
  calculateBounds(object) {
    return {
      left: object.x,
      right: object.x + object.width,
      top: object.y,
      bottom: object.y + object.height,
    };
  }

  updateGoalY(goalY) {
    this.goalY = goalY;
  }

  spawnObstacle() {
    // 重み付きランダム選択で障害物タイプを決定
    const totalWeight = Object.values(this.obstacleTypes).reduce(
      (sum, type) => sum + type.weight,
      0
    );
    let random = Math.random() * totalWeight;

    let selectedType;
    for (const [typeName, typeConfig] of Object.entries(this.obstacleTypes)) {
      random -= typeConfig.weight;
      if (random <= 0) {
        selectedType = typeName;
        break;
      }
    }

    // ゴール位置をチェック
    const spawnY = this.canvas.height / 2 + this.camera.y;
    if (spawnY >= this.goalY - 100) {
      return;
    }

    // Y座標を厚さの整数倍に調整
    const adjustedSpawnY = this.adjustToThickness(spawnY + this.wallThickness);

    // 選択されたタイプの障害物を生成
    const obstacle = this.obstacleTypes[selectedType].create(adjustedSpawnY);
    this.obstacles.push(obstacle);
  }

  updateObstacles() {
    // 画面外に出た障害物を削除（カメラ位置を基準に判定）
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];

      // カメラ位置を考慮して画面外判定
      if (obstacle.y + obstacle.height < this.camera.y - this.canvas.height) {
        this.obstacles.splice(i, 1);
        return true; // スコア加算が必要
      }
    }

    // 新しい障害物の生成
    this.obstacleSpawnTimer++;
    if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
      this.spawnObstacle();
      this.obstacleSpawnTimer = 0;
      // 難易度上昇（障害物の間隔を狭く）、最小値を考慮
      const oldInterval = this.obstacleSpawnInterval;
      this.obstacleSpawnInterval = Math.max(
        this.minObstacleSpawnInterval,
        this.obstacleSpawnInterval - 1
      );

      // 値が変更された場合のみコンソールログに出力
      if (oldInterval !== this.obstacleSpawnInterval) {
        console.log(
          `update obstacle spawn interval: ${oldInterval} → ${this.obstacleSpawnInterval}`
        );
      }
    }

    return false; // スコア加算不要
  }

  checkCollisions(plane) {
    // 紙飛行機の境界を一度だけ計算（当たり判定を少しだけ小さくしている）
    const planeBounds = {
      left: plane.x + (plane.size * 1) / 4,
      right: plane.x + (plane.size * 3) / 4,
      top: plane.y + (plane.size * 1) / 4,
      bottom: plane.y + (plane.size * 3) / 4,
    };

    for (const obstacle of this.obstacles) {
      // 障害物の境界を一度だけ計算
      const obstacleBounds = this.calculateBounds(obstacle);

      // 矩形同士の衝突判定
      if (this.isColliding(planeBounds, obstacleBounds)) {
        return true;
      }
    }
    return false;
  }

  // 衝突判定を独立したメソッドに分離
  isColliding(bounds1, bounds2) {
    return (
      bounds1.left < bounds2.right &&
      bounds1.right > bounds2.left &&
      bounds1.top < bounds2.bottom &&
      bounds1.bottom > bounds2.top
    );
  }

  draw(ctx) {
    ctx.fillStyle = "rgba(55, 147, 223, 0.7)";
    ctx.strokeStyle = "rgba(55, 148, 223, 0.9)";
    ctx.lineWidth = 2;

    for (const obstacle of this.obstacles) {
      // カメラ位置を考慮した描画位置
      const drawY = obstacle.y - this.camera.y + this.canvas.height / 2;
      ctx.fillRect(obstacle.x, drawY, obstacle.width, obstacle.height);
      ctx.strokeRect(obstacle.x, drawY, obstacle.width, obstacle.height);
    }
  }

  reset() {
    this.obstacles = [];
    this.obstacleSpawnTimer = 0;
    this.obstacleSpawnInterval = this.initialObstacleSpawnInterval;
    console.log(`reset obstacle spawn interval: ${this.obstacleSpawnInterval}`);
  }

  getObstacles() {
    return this.obstacles;
  }

  // 障害物生成タイマーをリセットするメソッドを追加
  resetObstacleSpawnTimer() {
    this.obstacleSpawnTimer = 0;
  }

  // 難易度設定を適用するメソッド
  setDifficultySettings(difficultySettings) {
    this.initialObstacleSpawnInterval = difficultySettings.initialObstacleSpawnInterval;
    this.minObstacleSpawnInterval = difficultySettings.minimumObstacleSpawnInterval;
    this.obstacleSpawnInterval = this.initialObstacleSpawnInterval;
    this.obstacleSpeedMultiplier = difficultySettings.obstacleSpeedMultiplier || 1.0;
  }
}
