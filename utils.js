/**
 * 共通ユーティリティ関数
 */

// 座標調整ユーティリティ
const CoordinateUtils = {
    /**
     * 値を指定された厚さの整数倍に調整
     * @param {number} value - 調整する値
     * @param {number} thickness - 基準となる厚さ
     * @returns {number} 調整された値
     */
    adjustToThickness: (value, thickness) => {
        return Math.round(value / thickness) * thickness;
    },

    /**
     * ピクセルをメートルに変換
     * @param {number} pixels - ピクセル値
     * @param {number} pixelsPerMeter - 1メートルあたりのピクセル数
     * @returns {number} メートル値
     */
    pixelsToMeters: (pixels, pixelsPerMeter) => {
        return pixels / pixelsPerMeter;
    },

    /**
     * メートルをピクセルに変換
     * @param {number} meters - メートル値
     * @param {number} pixelsPerMeter - 1メートルあたりのピクセル数
     * @returns {number} ピクセル値
     */
    metersToPixels: (meters, pixelsPerMeter) => {
        return meters * pixelsPerMeter;
    }
};

// 衝突判定ユーティリティ
const CollisionUtils = {
    /**
     * 矩形同士の衝突判定
     * @param {Object} bounds1 - 1つ目の矩形の境界
     * @param {Object} bounds2 - 2つ目の矩形の境界
     * @returns {boolean} 衝突しているかどうか
     */
    isRectColliding: (bounds1, bounds2) => {
        return bounds1.left < bounds2.right &&
               bounds1.right > bounds2.left &&
               bounds1.top < bounds2.bottom &&
               bounds1.bottom > bounds2.top;
    },

    /**
     * オブジェクトの境界を計算
     * @param {Object} object - 境界を計算するオブジェクト
     * @returns {Object} 境界オブジェクト
     */
    calculateBounds: (object) => {
        return {
            left: object.x,
            right: object.x + (object.width || object.size),
            top: object.y,
            bottom: object.y + (object.height || object.size)
        };
    }
};

// 画面管理ユーティリティ
const ScreenUtils = {
    /**
     * 画面の表示/非表示を切り替え
     * @param {string} targetScreenId - 表示する画面のID
     * @param {Array<string>} allScreenIds - 全ての画面IDの配列
     * @param {boolean} show - 表示するかどうか
     */
    toggleScreen: (targetScreenId, allScreenIds, show = true) => {
        allScreenIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.toggle('hidden', id !== targetScreenId || !show);
            }
        });
    }
};

// イベント管理ユーティリティ
const EventUtils = {
    /**
     * 複数のイベントリスナーを一括で設定
     * @param {Array} eventConfigs - イベント設定の配列
     */
    setupEventListeners: (eventConfigs) => {
        eventConfigs.forEach(config => {
            if (config.element) {
                config.events.forEach(event => {
                    config.element.addEventListener(event, config.handler);
                });
            }
        });
    }
};

// 描画ユーティリティ
const DrawingUtils = {
    /**
     * グラデーション背景を作成
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {Array} colors - 色の配列
     */
    createGradientBackground: (ctx, width, height, colors) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
};
