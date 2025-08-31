/**
 * 雲の管理を行うクラス
 * 雲の生成、移動、描画、視差効果を制御
 */
class CloudManager {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.clouds = [];
    this.maxClouds = 6; // 最大雲数を削減
    this.lastSpawnTime = 0;
    this.camera = camera;

    // 雲の形状を簡素化（3種類のシンプルな形状）
    this.CLOUD_SHAPES = {
      0: [
        // 小さい雲（3個の円で構成、非対称）
        { x: 0, y: 0, r: 1.0 }, // 中心
        { x: 0.9, y: -0.4, r: 0.7 }, // 右上寄り（重なり）
        { x: -0.6, y: 0.6, r: 0.8 }, // 左下寄り（重なり）
      ],
      1: [
        // 中くらいの雲（4個の円で構成、非対称）
        { x: 0, y: 0, r: 1.1 }, // 中心
        { x: 1.2, y: -0.3, r: 0.8 }, // 右上寄り（重なり）
        { x: -0.4, y: -0.8, r: 0.7 }, // 左上寄り（重なり）
        { x: -1.0, y: 0.5, r: 0.6 }, // 左下寄り（重なり）
      ],
      2: [
        // 大きい雲（5個の円で構成、非対称）
        { x: 0, y: 0, r: 1.2 }, // 中心
        { x: 1.0, y: -0.5, r: 1.0 }, // 右上寄り（重なり）
        { x: -0.7, y: -0.8, r: 0.8 }, // 左上寄り（重なり）
        { x: 1.5, y: 0.4, r: 0.9 }, // 右下寄り（重なり）
        { x: -1.0, y: 0.7, r: 0.7 }, // 左下寄り（重なり）
      ],
    };

    this.initializeClouds(camera.y);
  }

  // 雲の生成処理を統一
  createCloud(sizeFactor, x, y, speed, type, parallaxFactor, originalCameraY) {
    return {
      size: sizeFactor * 150 + 150,
      x: x,
      y: y,
      speed: speed,
      type: type,
      parallaxFactor: parallaxFactor,
      originalCameraY: originalCameraY,
    };
  }

  /**
   * 初期化時に雲を画面全体に配置
   */
  initializeClouds(originalCameraY) {
    for (let i = 0; i < this.maxClouds; i++) {
      this.spawnCloud(true, originalCameraY);
    }
  }

  /**
   * 新しい雲を生成
   * @param {boolean} initialize - 初期化用かどうか
   */
  spawnCloud(initialize = false, originalCameraY) {
    const sizeFactor = Math.random();
    const cloud = this.createCloud(
      sizeFactor,
      this.canvas.width * Math.random(),
      initialize ? this.canvas.height * Math.random() : this.canvas.height,
      Math.random() * 0.4 + 0.3,
      Math.floor(Math.random() * 3),
      sizeFactor * 0.2 + 0.1,
      originalCameraY,
    );

    this.clouds.push(cloud);
  }

  /**
   * 雲の位置を更新（最適化版）
   * @param {number} cameraY - カメラのY座標（視差効果用）
   */
  updateClouds(cameraY) {
    // 各雲の位置を更新
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];

      // 軽微な視差効果を追加（カメラの縦移動に対して）
      cloud.y -= (cameraY - cloud.originalCameraY) * cloud.parallaxFactor;
      cloud.originalCameraY = cameraY;

      if (cloud.x + cloud.size < 0 || cloud.y + cloud.size < 0) {
        this.resetCloud(cloud, cameraY);
      }
    }
  }

  // 雲のリセット処理を統一
  resetCloud(cloud, cameraY) {
    const sizeFactor = Math.random();
    cloud.size = sizeFactor * 150 + 150;
    cloud.x = this.canvas.width * Math.random();
    cloud.y = this.canvas.height + cloud.size;
    cloud.speed = Math.random() * 0.4 + 0.3;
    cloud.type = Math.floor(Math.random() * 3);
    cloud.parallaxFactor = sizeFactor * 0.2 + 0.1;
    cloud.originalCameraY = cameraY;
  }

  /**
   * 雲の状態をリセット
   */
  reset() {
    this.clouds = [];
    this.lastSpawnTime = 0;

    // タイトル画面用の雲の配置（下から上に流れる用）
    this.initializeTitleScreenClouds();
  }

  /**
   * タイトル画面用の雲の初期配置
   */
  initializeTitleScreenClouds() {
    for (let i = 0; i < this.maxClouds; i++) {
      const sizeFactor = Math.random();
      const cloud = this.createCloud(
        sizeFactor,
        this.canvas.width * Math.random(),
        this.canvas.height * Math.random(),
        Math.random() * 0.4 + 0.3,
        Math.floor(Math.random() * 3),
        sizeFactor * 0.2 + 0.1,
        0,
      );
      this.clouds.push(cloud);
    }
  }

  /**
   * 全ての雲を描画
   * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
   */
  draw(ctx) {
    // 描画コンテキストの設定を最適化
    ctx.fillStyle = "#FFFFFF";
    ctx.globalAlpha = 1.0;

    this.clouds.forEach((cloud) => this.drawCloud(ctx, cloud));
  }

  /**
   * 個別の雲を描画（最適化版）
   * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
   * @param {Object} cloud - 雲のオブジェクト
   */
  drawCloud(ctx, cloud) {
    const baseRadius = cloud.size * 0.25;
    const x = cloud.x;
    const y = cloud.y;
    const shape = this.CLOUD_SHAPES[cloud.type];

    // 雲の種類に応じた形状を描画
    shape.forEach((point) => {
      ctx.beginPath();
      ctx.arc(
        x + point.x * baseRadius,
        y + point.y * baseRadius,
        point.r * baseRadius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });

    // 中心部分の円を描画
    ctx.beginPath();
    ctx.arc(x, y, baseRadius * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * タイトル画面用の雲の更新（下から上に流れる）
   */
  updateTitleScreenClouds() {
    // 各雲の位置を更新（下から上に流れる）
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];

      // 下から上に流れる動き
      cloud.y -= cloud.speed;

      // 画面外に出た雲を下から再配置
      if (cloud.y + cloud.size < 0) {
        this.resetCloud(cloud, 0);
        cloud.y = this.canvas.height + cloud.size; // 下から開始
      }
    }
  }
}
