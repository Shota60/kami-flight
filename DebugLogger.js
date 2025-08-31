/**
 * デバッグログ表示クラス
 * パフォーマンス監視とゲーム状態の可視化を行う
 */
class DebugLogger {
  // ==================== 定数定義 ====================
  static CONFIG = {
    MAX_LOGS: 15,
    UPDATE_INTERVAL: 500, // 0.5秒ごとに更新
    LOG_WIDTH: 350,
    FONT_SIZE: 12,
    LINE_HEIGHT: 16,
    PADDING: 8,
  };

  static STYLES = {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    textColor: "#ffffff",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  };

  static LOG_KEYS = {
    GAME_STATE: "Game State",
    REMAINING_DISTANCE: "Remaining Distance",
    CAMERA_Y: "Camera Y",
    PLANE_Y: "Plane Y",
    PLANE_VERT_SPEED: "Plane Vert Speed",
    PLANE_HORIZ_SPEED: "Plane Horiz Speed",
    ACTIVE_OBSTACLES: "Active Obstacles",
    OBSTACLE_SPAWN_TIMER: "Obstacle Spawn Timer",
    OBSTACLE_SPAWN_INTERVAL: "Obstacle Spawn Interval",
    ACTIVE_CLOUDS: "Active Clouds",
    MAX_CLOUDS: "Max Clouds",
    FPS: "FPS",
    DELTA_TIME: "Delta Time",
    FRAME_COUNT: "Frame Count",
  };

  // ==================== コンストラクタ・初期化 ====================
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.logs = [];
    this.lastLogTime = 0;

    this.initializeLogs();
  }

  // ==================== ログ管理メソッド ====================

  /**
   * ログを追加または更新
   * @param {string} key - ログのキー
   * @param {any} value - ログの値
   */
  addLog(key, value) {
    const existingLogIndex = this.findLogIndex(key);

    if (existingLogIndex !== -1) {
      this.updateExistingLog(existingLogIndex, value);
    } else {
      this.addNewLog(key, value);
    }

    this.manageLogCount();
  }

  /**
   * 既存ログのインデックスを検索
   * @param {string} key - 検索するログのキー
   * @returns {number} ログのインデックス（見つからない場合は-1）
   */
  findLogIndex(key) {
    return this.logs.findIndex((log) => log.key === key);
  }

  /**
   * 既存ログを更新
   * @param {number} index - 更新するログのインデックス
   * @param {any} value - 新しい値
   */
  updateExistingLog(index, value) {
    this.logs[index].value = value;
    this.logs[index].timestamp = Date.now();
  }

  /**
   * 新しいログを追加
   * @param {string} key - ログのキー
   * @param {any} value - ログの値
   */
  addNewLog(key, value) {
    this.logs.push({
      key,
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * ログ数を管理（最大数を超えた場合、古いログを削除）
   */
  manageLogCount() {
    if (this.logs.length > DebugLogger.CONFIG.MAX_LOGS) {
      this.logs.shift();
    }
  }

  /**
   * 初期ログを設定
   */
  initializeLogs() {
    const initialLogs = [
      [DebugLogger.LOG_KEYS.GAME_STATE, "Initializing..."],
      [DebugLogger.LOG_KEYS.REMAINING_DISTANCE, "---"],
      [DebugLogger.LOG_KEYS.CAMERA_Y, "---"],
      [DebugLogger.LOG_KEYS.PLANE_Y, "---"],
      [DebugLogger.LOG_KEYS.PLANE_VERT_SPEED, "---"],
      [DebugLogger.LOG_KEYS.PLANE_HORIZ_SPEED, "---"],
      [DebugLogger.LOG_KEYS.ACTIVE_OBSTACLES, "---"],
      [DebugLogger.LOG_KEYS.OBSTACLE_SPAWN_TIMER, "---"],
      [DebugLogger.LOG_KEYS.OBSTACLE_SPAWN_INTERVAL, "---"],
      [DebugLogger.LOG_KEYS.ACTIVE_CLOUDS, "---"],
      [DebugLogger.LOG_KEYS.MAX_CLOUDS, "---"],
      [DebugLogger.LOG_KEYS.FPS, "---"],
      [DebugLogger.LOG_KEYS.DELTA_TIME, "---"],
      [DebugLogger.LOG_KEYS.FRAME_COUNT, "---"],
    ];

    initialLogs.forEach(([key, value]) => this.addLog(key, value));
  }

  // ==================== ログ更新メソッド ====================

  /**
   * ゲーム状態のログを更新（間隔制御付き）
   * @param {Object} gameState - ゲームの状態情報
   */
  updateGameState(gameState) {
    if (!this.shouldUpdateLogs()) return;

    this.updateGameStateLogs(gameState);
    this.lastLogTime = Date.now();
  }

  /**
   * ログ更新のタイミングをチェック
   * @returns {boolean} 更新すべきかどうか
   */
  shouldUpdateLogs() {
    const currentTime = Date.now();
    return currentTime - this.lastLogTime >= DebugLogger.CONFIG.UPDATE_INTERVAL;
  }

  /**
   * ゲーム状態のログを更新
   * @param {Object} gameState - ゲームの状態情報
   */
  updateGameStateLogs(gameState) {
    this.addLog(DebugLogger.LOG_KEYS.GAME_STATE, gameState.gameState);
    this.addLog(DebugLogger.LOG_KEYS.REMAINING_DISTANCE, Math.round(gameState.remainingDistance));
    this.addLog(DebugLogger.LOG_KEYS.CAMERA_Y, Math.round(gameState.camera.y));
    this.addLog(DebugLogger.LOG_KEYS.PLANE_Y, Math.round(gameState.plane.y));
  }

  /**
   * 飛行機の速度情報を毎フレーム更新
   * @param {Object} plane - 飛行機オブジェクト
   */
  updatePlaneVelocity(plane) {
    if (!plane) return;

    this.addLog(DebugLogger.LOG_KEYS.PLANE_VERT_SPEED, this.formatSpeed(plane.verticalSpeed));
    this.addLog(
      DebugLogger.LOG_KEYS.PLANE_HORIZ_SPEED,
      this.calculateHorizontalSpeedWithDirection(plane),
    );
  }

  /**
   * 水平速度を進行方向に応じて計算
   * @param {Object} plane - 飛行機オブジェクト
   * @returns {number} 符号付きの水平速度
   */
  calculateHorizontalSpeedWithDirection(plane) {
    const baseSpeed = plane.horizontalSpeed;
    const direction = plane.direction;
    const speedWithDirection = direction === "left" ? -baseSpeed : baseSpeed;

    return this.formatSpeed(speedWithDirection);
  }

  /**
   * 速度値を適切な形式にフォーマット
   * @param {number} speed - 速度値
   * @returns {number} フォーマットされた速度値
   */
  formatSpeed(speed) {
    return Math.round(speed * 100) / 100;
  }

  /**
   * 障害物マネージャーの状態をログに追加
   * @param {ObstacleManager} obstacleManager - 障害物マネージャー
   */
  updateObstacleState(obstacleManager) {
    if (!this.isValidObstacleManager(obstacleManager)) return;

    this.addLog(DebugLogger.LOG_KEYS.ACTIVE_OBSTACLES, obstacleManager.obstacles.length);
    this.addLog(
      DebugLogger.LOG_KEYS.OBSTACLE_SPAWN_TIMER,
      Math.round(obstacleManager.obstacleSpawnTimer),
    );
    this.addLog(
      DebugLogger.LOG_KEYS.OBSTACLE_SPAWN_INTERVAL,
      obstacleManager.obstacleSpawnInterval,
    );
  }

  /**
   * 雲マネージャーの状態をログに追加
   * @param {CloudManager} cloudManager - 雲マネージャー
   */
  updateCloudState(cloudManager) {
    if (!this.isValidCloudManager(cloudManager)) return;

    this.addLog(DebugLogger.LOG_KEYS.ACTIVE_CLOUDS, cloudManager.clouds.length);
    this.addLog(DebugLogger.LOG_KEYS.MAX_CLOUDS, cloudManager.maxClouds);
  }

  /**
   * パフォーマンスメトリクスをログに追加
   * @param {number} deltaTime - フレーム間の時間差（秒）
   * @param {number} frameCount - フレーム数
   */
  updatePerformanceMetrics(deltaTime, frameCount) {
    this.addLog(DebugLogger.LOG_KEYS.FPS, this.calculateFPS(deltaTime));
    this.addLog(DebugLogger.LOG_KEYS.DELTA_TIME, this.formatDeltaTime(deltaTime));
    this.addLog(DebugLogger.LOG_KEYS.FRAME_COUNT, frameCount);
  }

  // ==================== バリデーションメソッド ====================

  /**
   * 障害物マネージャーが有効かチェック
   * @param {ObstacleManager} obstacleManager - 障害物マネージャー
   * @returns {boolean} 有効かどうか
   */
  isValidObstacleManager(obstacleManager) {
    return obstacleManager && obstacleManager.obstacles;
  }

  /**
   * 雲マネージャーが有効かチェック
   * @param {CloudManager} cloudManager - 雲マネージャー
   * @returns {boolean} 有効かどうか
   */
  isValidCloudManager(cloudManager) {
    return cloudManager && cloudManager.clouds;
  }

  // ==================== 計算・フォーマットメソッド ====================

  /**
   * FPSを計算
   * @param {number} deltaTime - フレーム間の時間差（秒）
   * @returns {number|string} 計算されたFPSまたは'---'
   */
  calculateFPS(deltaTime) {
    return deltaTime > 0 ? Math.round(1 / deltaTime) : "---";
  }

  /**
   * デルタタイムをフォーマット
   * @param {number} deltaTime - フレーム間の時間差（秒）
   * @returns {number|string} フォーマットされたデルタタイムまたは'---'
   */
  formatDeltaTime(deltaTime) {
    return deltaTime > 0 ? Math.round(deltaTime * 1000) / 1000 : "---";
  }

  // ==================== 描画メソッド ====================

  /**
   * ログを画面に描画
   */
  render() {
    if (this.logs.length === 0) return;

    this.ctx.save();
    this.drawLogBackground();
    this.drawLogText();
    this.ctx.restore();
  }

  /**
   * ログの背景を描画
   */
  drawLogBackground() {
    const logHeight = this.calculateLogHeight();

    this.ctx.fillStyle = DebugLogger.STYLES.backgroundColor;
    this.ctx.fillRect(0, 0, DebugLogger.CONFIG.LOG_WIDTH, logHeight);
  }

  /**
   * ログのテキストを描画
   */
  drawLogText() {
    this.setupTextStyle();

    let y = DebugLogger.CONFIG.PADDING;
    this.logs.forEach((log) => {
      this.drawLogLine(log, y);
      y += DebugLogger.CONFIG.LINE_HEIGHT;
    });
  }

  /**
   * テキスト描画のスタイルを設定
   */
  setupTextStyle() {
    this.ctx.font = `${DebugLogger.CONFIG.FONT_SIZE}px monospace`;
    this.ctx.fillStyle = DebugLogger.STYLES.textColor;
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";
  }

  /**
   * 個別のログ行を描画
   * @param {Object} log - ログオブジェクト
   * @param {number} y - Y座標
   */
  drawLogLine(log, y) {
    const logText = `${log.key}: ${log.value}`;
    this.ctx.fillText(logText, DebugLogger.CONFIG.PADDING, y);
  }

  /**
   * ログの高さを計算
   * @returns {number} ログの高さ
   */
  calculateLogHeight() {
    return this.logs.length * DebugLogger.CONFIG.LINE_HEIGHT + DebugLogger.CONFIG.PADDING * 2;
  }

  // ==================== ユーティリティメソッド ====================

  /**
   * ログをクリア
   */
  clear() {
    this.logs = [];
  }

  /**
   * ログの表示/非表示を切り替え
   * @param {boolean} visible - 表示するかどうか
   */
  setVisible(visible) {
    this.visible = visible;
  }
}
