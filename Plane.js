class Plane {
  // クラス定数を定義
  static PLANE_CONFIG = {
    SIZE: 15,
    HORIZONTAL_SPEED: 1.5,
    MAX_VERTICAL_SPEED: 1.5,
    JUMP_SPEED: 2,
    GRAVITY: 0.08,
    ROTATION_ANGLE: Math.PI / 3,
  };

  constructor(canvas) {
    this.canvas = canvas;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.size = Plane.PLANE_CONFIG.SIZE;
    this.direction = "right"; // 'left' or 'right'
    this.horizontalSpeed = Plane.PLANE_CONFIG.HORIZONTAL_SPEED;
    this.verticalSpeed = 0;
    this.maxVerticalSpeed = Plane.PLANE_CONFIG.MAX_VERTICAL_SPEED;
    this.jumpSpeed = Plane.PLANE_CONFIG.JUMP_SPEED;
  }

  update() {
    // 水平移動
    this.x += this.direction === "left" ? -this.horizontalSpeed : this.horizontalSpeed;

    // 垂直方向の移動（上昇・落下）
    this.y += this.verticalSpeed;

    // 重力の適用
    if (this.verticalSpeed < this.maxVerticalSpeed) {
      this.verticalSpeed += Plane.PLANE_CONFIG.GRAVITY;
    }
    if (this.verticalSpeed > this.maxVerticalSpeed) {
      this.verticalSpeed = this.maxVerticalSpeed;
    }
  }

  changeDirection() {
    this.direction = this.direction === "left" ? "right" : "left";
  }

  jump() {
    this.verticalSpeed = -this.jumpSpeed;
  }

  reset() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.direction = "left";
    this.verticalSpeed = 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.size / 2, this.canvas.height / 2 + this.size / 2);

    // 回転角度の計算
    const rotationAngle =
      this.direction === "right"
        ? -Plane.PLANE_CONFIG.ROTATION_ANGLE
        : Plane.PLANE_CONFIG.ROTATION_ANGLE;

    ctx.rotate(rotationAngle);

    // 紙飛行機を描画
    this.drawPlaneShape(ctx);

    ctx.restore();
  }

  // 紙飛行機の形状描画を分離
  drawPlaneShape(ctx) {
    // 紙飛行機（真下を向いた細長い二等辺三角形）を描画
    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    // 三角形の頂点（下向き）
    ctx.moveTo(0, this.size / 2);
    // 左の底角
    ctx.lineTo(-this.size / 3, -this.size / 2);
    // 右の底角
    ctx.lineTo(this.size / 3, -this.size / 2);
    ctx.closePath();
    ctx.fill();

    // 境界線
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.size,
      top: this.y,
      bottom: this.y + this.size,
    };
  }
}
