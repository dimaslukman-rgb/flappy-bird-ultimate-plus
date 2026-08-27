// Procedural neon draw routines. Used as fallback when assets are absent,
// and always for the bird since we render skin colors at runtime.
export function drawBird(ctx, bird, skin) {
  const color = skin?.color ?? '#ffcf3d';
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, bird.radius, bird.radius * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = shade(color, -25);
  ctx.beginPath();
  ctx.ellipse(-4, 2, bird.radius * 0.55, bird.radius * 0.4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(bird.radius * 0.35, -bird.radius * 0.2, bird.radius * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(bird.radius * 0.42, -bird.radius * 0.2, bird.radius * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.moveTo(bird.radius * 0.7, 0);
  ctx.lineTo(bird.radius * 1.4, bird.radius * 0.1);
  ctx.lineTo(bird.radius * 0.7, bird.radius * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawPipe(ctx, pipe, color = '#39ff88') {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
  ctx.fillRect(pipe.x, pipe.bottomTop, pipe.width, 10000);
  ctx.shadowBlur = 0;
  ctx.fillStyle = shade(color, -25);
  ctx.fillRect(pipe.x - 4, pipe.topHeight - 10, pipe.width + 8, 20);
  ctx.fillRect(pipe.x - 4, pipe.bottomTop - 10, pipe.width + 8, 20);
  ctx.restore();
}

export function drawGround(ctx, ground, logicalHeight, color = '#1e1e3a') {
  const y = ground.surfaceY(logicalHeight);
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, y, /* full width set by caller clip */ 9999, ground.height);
  ctx.strokeStyle = 'rgba(0,229,255,0.15)';
  ctx.lineWidth = 1;
  const stride = 40;
  for (let x = -ground.offset; x < logicalHeight * 2; x += stride) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + ground.height);
    ctx.stroke();
  }
  ctx.restore();
}

function shade(hex, percent) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (n & 0xff) + percent));
  return `rgb(${r},${g},${b})`;
}