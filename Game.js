class PaperPlaneGame {
    // ==================== クラス定数 ====================
    static GAME_CONFIG = {
        GOAL_DISTANCE: 10000,
        INITIAL_OBSTACLE_SPAWN_INTERVAL: 110,
        MINIMUM_OBSTACLE_SPAWN_INTERVAL: 45,
        PIXELS_PER_METER: 100,
        DISPLAY_DEBUG_LOG: false
    };

    // ==================== コンストラクタ・初期化 ====================
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        // window.addEventListener('resize', () => this.resizeCanvas());
        
        this.jumpButton = document.getElementById('jump-button');
        this.initializeGameState();
        this.obstacleManager = new ObstacleManager(this.canvas, this.camera, this.goalY);
        this.cloudManager = new CloudManager(this.canvas, this.camera);
        
        // デバッグロガーを初期化
        this.debugLogger = new DebugLogger(this.canvas, this.ctx);
        
        this.lastTime = 0;
        this.gameStartTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        
        this.setupEventListeners();
        this.showStartScreen();
        requestAnimationFrame(this.gameLoop);
    }

    // ==================== 初期化・設定メソッド ====================
    
    initializeGameState() {
        this.gameState = 'start';
        this.startY = this.canvas.height / 2;
        this.goalY = this.startY + PaperPlaneGame.GAME_CONFIG.GOAL_DISTANCE;
        this.remainingDistance = PaperPlaneGame.GAME_CONFIG.GOAL_DISTANCE;
        this.camera = { x: 0, y: 0 };
        this.initialObstacleSpawnInterval = PaperPlaneGame.GAME_CONFIG.INITIAL_OBSTACLE_SPAWN_INTERVAL;
        this.minObstacleSpawnInterval = PaperPlaneGame.GAME_CONFIG.MINIMUM_OBSTACLE_SPAWN_INTERVAL;
        this.plane = new Plane(this.canvas);
    }

    setupEventListeners() {
        // イベント設定を統合
        const eventConfigs = [
            // キャンバスイベント
            { element: this.canvas, events: ['click', 'touchstart'], handler: this.handleTap.bind(this) },
            { element: this.canvas, events: ['touchstart'], handler: (e) => e.preventDefault() },
            // キーボードイベント
            { element: document, events: ['keydown'], handler: this.handleKeyDown.bind(this) },
            // ボタンイベント
            { element: document.getElementById('start-button'), events: ['click'], handler: this.startGame.bind(this) },
            { element: document.getElementById('restart-button'), events: ['click'], handler: this.restartGame.bind(this) },
            { element: document.getElementById('play-again-button'), events: ['click'], handler: this.playAgain.bind(this) },
            // ジャンプボタン
            { element: this.jumpButton, events: ['click', 'touchstart'], handler: this.handleJumpButtonClick.bind(this) }
        ];

        // 一括でイベントリスナーを設定
        eventConfigs.forEach(config => {
            if (config.element) {
                config.events.forEach(event => {
                    config.element.addEventListener(event, config.handler);
                });
            }
        });
    }

    resizeCanvas() {
        const screenWidth = window.innerWidth || document.documentElement.clientWidth;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight;
        
        let canvasWidth, canvasHeight;
        
        if (screenWidth >= 768) {
            const maxWidth = Math.min(screenWidth * 0.6, 600);
            const maxHeight = Math.min(screenHeight * 0.8, 900);
            
            if (maxWidth / maxHeight > 3/4) {
                canvasHeight = maxHeight;
                canvasWidth = maxHeight * (3/4);
            } else {
                canvasWidth = maxWidth;
                canvasHeight = maxWidth * (4/3);
            }
        } else {
            canvasWidth = Math.floor(screenWidth * 0.9);
            canvasHeight = Math.floor(screenHeight * 0.9);
        }
        
        this.canvas.width = Math.floor(canvasWidth);
        this.canvas.height = Math.floor(canvasHeight);
        
        Object.assign(this.canvas.style, {
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%'
        });
        
        if (this.plane) this.initializeGameState();
    }

    // ==================== イベントハンドラー ====================
    
    handleTap(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.gameState === 'playing') {
            this.plane.changeDirection();
        }
    }
    
    handleKeyDown(event) {
        if (this.gameState === 'playing' && event.code === 'Space') {
            event.preventDefault();
            this.plane.jump();
            this.obstacleManager.resetObstacleSpawnTimer();
        }
    }
    
    handleJumpButtonClick() {
        if (this.gameState === 'playing') {
            this.plane.jump();
            this.obstacleManager.resetObstacleSpawnTimer();
            
            this.jumpButton.classList.add('active');
            setTimeout(() => this.jumpButton.classList.remove('active'), 250);
        }
    }

    // ==================== ゲーム状態管理 ====================
    
    startGame() {
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.remainingDistance = this.goalY;
        this.obstacleManager.reset();
        this.cloudManager.reset();
        this.obstacleManager.updateGoalY(this.goalY);
        this.camera.x = 0;
        this.camera.y = 0;
        this.obstacleSpawnInterval = this.initialObstacleSpawnInterval;
        this.plane.reset();
        this.hideStartScreen();
        this.hideGameClearScreen();
        this.jumpButton.classList.remove('hidden');
    }
    
    restartGame() {
        document.getElementById('game-over').classList.add('hidden');
        this.showStartScreen();
    }
    
    playAgain() {
        document.getElementById('game-clear').classList.add('hidden');
        this.showStartScreen();
    }
    
    gameOver() {
        this.showGameOverScreen();
    }
    
    gameClear() {
        this.showGameClearScreen();
    }

    // ==================== 画面表示管理 ====================
    
    // 画面表示管理を統一
    toggleScreen(screenId, show = true) {
        const screens = ['game-start', 'game-over', 'game-clear'];
        screens.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.toggle('hidden', id !== screenId || !show);
            }
        });
    }
    
    showStartScreen() {
        this.gameState = 'start';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.cloudManager.reset();
        this.toggleScreen('game-start', true);
        this.jumpButton.classList.add('hidden');
    }
    
    hideStartScreen() {
        this.toggleScreen('game-start', false);
    }
    
    showGameOverScreen() {
        this.gameState = 'gameOver';
        const distanceInMeters = this.pixelsToMeters(this.remainingDistance).toFixed(1);
        const halfGoalDistance = PaperPlaneGame.GAME_CONFIG.GOAL_DISTANCE / PaperPlaneGame.GAME_CONFIG.PIXELS_PER_METER / 2;
        
        const message = distanceInMeters > halfGoalDistance ? 
            `あと ${distanceInMeters}m でした...` : 
            `あと ${distanceInMeters}m だったのに...`;
            
        document.getElementById('final-score').textContent = message;
        this.toggleScreen('game-over', true);
        this.jumpButton.classList.add('hidden');
    }
    
    showGameClearScreen() {
        this.gameState = 'gameClear';
        this.toggleScreen('game-clear', true);
        this.jumpButton.classList.add('hidden');
    }
    
    hideGameClearScreen() {
        this.toggleScreen('game-clear', false);
    }

    // ==================== ゲーム更新処理 ====================
    
    update() {
        this.updateClouds();
        
        if (this.gameState === 'playing') {
            this.updateCamera();
            this.updatePlane();
            this.updateObstacles();
            this.checkCollisions();
        }
        
        // デバッグログを更新（設定が有効な場合のみ）
        if (PaperPlaneGame.GAME_CONFIG.DISPLAY_DEBUG_LOG) {
            this.updateDebugLogs();
        }
    }
    
    updateClouds() {
        if (this.gameState === 'start') {
            this.cloudManager.updateTitleScreenClouds();
        } else {
            this.cloudManager.updateClouds(this.camera.y);
        }
    }
    
    updateCamera() {
        this.camera.y = this.plane.y;
    }

    updatePlane() {
        this.plane.update();
        
        if (this.plane.x < 0 || this.plane.x + this.plane.size > this.canvas.width) {
            this.gameOver();
            return;
        }
        
        this.remainingDistance = this.goalY - this.plane.y;
        
        if (this.remainingDistance <= 0) {
            this.remainingDistance = 0;
            this.gameClear();
        }
    }
    
    updateObstacles() {
        this.obstacleManager.updateObstacles();
    }
    
    checkCollisions() {
        if (this.obstacleManager.checkCollisions(this.plane)) {
            this.gameOver();
        }
    }

    // ==================== デバッグログ更新 ====================
    
    updateDebugLogs() {
        // ゲーム状態のログを更新
        this.debugLogger.updateGameState({
            gameState: this.gameState,
            remainingDistance: this.remainingDistance,
            camera: this.camera,
            plane: this.plane
        });
        
        // 飛行機の速度情報を毎フレーム更新
        this.debugLogger.updatePlaneVelocity(this.plane);
        
        // 障害物マネージャーの状態をログに追加
        this.debugLogger.updateObstacleState(this.obstacleManager);
        
        // 雲マネージャーの状態をログに追加
        this.debugLogger.updateCloudState(this.cloudManager);
        
        // パフォーマンスメトリクスをログに追加
        // フレーム間の時間差を正確に計算
        const deltaTime = this.lastDeltaTime || 0;
        this.debugLogger.updatePerformanceMetrics(deltaTime, this.frameCount || 0);
        
        // フレームカウントを更新
        this.frameCount = (this.frameCount || 0) + 1;
    }

    // ==================== 描画処理 ====================
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        this.drawClouds();
        
        if (this.gameState === 'start') return;
        
        this.drawGoalArea();
        this.drawObstacles();
        this.drawPlane();
        this.drawDistanceIndicator();
        
        // デバッグログを描画（設定が有効な場合のみ）
        if (PaperPlaneGame.GAME_CONFIG.DISPLAY_DEBUG_LOG) {
            this.debugLogger.render();
        }
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawClouds() {
        this.cloudManager.draw(this.ctx);
    }
    
    drawPlane() {
        this.plane.draw(this.ctx);
    }
    
    drawObstacles() {
        this.obstacleManager.draw(this.ctx);
    }
    
    drawGoalArea() {
        if (this.gameState === 'playing' || this.gameState === 'gameClear') {
            const goalAreaY = this.goalY - this.plane.y + this.canvas.height/2;
            
            // ゴールライン
            this.ctx.strokeStyle = 'rgb(255, 0, 98)';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(0, goalAreaY);
            this.ctx.lineTo(this.canvas.width, goalAreaY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // GOALテキスト
            this.ctx.fillStyle = 'rgba(253, 58, 87, 0.8)';
            this.ctx.font = 'bold 28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('GOAL', this.canvas.width / 2, goalAreaY - 30);
        }
    }

    drawDistanceIndicator() {
        if (this.gameState === 'playing') {
            const indicatorWidth = 10;
            const indicatorHeight = 120;
            const margin = 20;
            const x = this.canvas.width - margin - indicatorWidth;
            const y = margin;
            
            // 背景
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fillRect(x, y, indicatorWidth, indicatorHeight);
            
            // 境界線
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, indicatorWidth, indicatorHeight);
            
            // ラベル
            ['START', 'GOAL'].forEach((label, index) => {
                this.ctx.fillStyle = index === 0 ? '#2E7D32' : '#D32F2F';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = index === 0 ? 'bottom' : 'top';
                const labelY = index === 0 ? y : y + indicatorHeight + 4;
                this.ctx.fillText(label, x + indicatorWidth / 2, labelY);
            });
            
            // 矢印
            const progress = (this.plane.y - this.startY) / (this.goalY - this.startY);
            const arrowY = y + progress * indicatorHeight;
            
            this.ctx.strokeStyle = '#1976D2';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, arrowY);
            this.ctx.lineTo(x + indicatorWidth, arrowY);
            this.ctx.closePath();
            this.ctx.stroke();
            
            // 数値
            const currentDistance = this.pixelsToMeters(this.remainingDistance).toFixed(1);
            this.ctx.fillStyle = '#1976D2';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`${currentDistance}m`, x - 5, arrowY);
        }
    }

    // ==================== ゲームループ ====================
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.lastDeltaTime = deltaTime / 1000; // 秒単位で保存
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    // ==================== ユーティリティメソッド ====================
    
    resetGameState() {
        this.initializeGameState();
    }

    pixelsToMeters(pixels) {
        return pixels / PaperPlaneGame.GAME_CONFIG.PIXELS_PER_METER;
    }

    metersToPixels(meters) {
        return meters * PaperPlaneGame.GAME_CONFIG.PIXELS_PER_METER;
    }
}

// ==================== ゲーム開始 ====================
window.addEventListener('load', () => {
    new PaperPlaneGame();
});
