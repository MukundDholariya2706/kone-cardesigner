export function createColorImage(color = "#CCCCCC", width = 16, height = 16) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext("2d");
  ctx.rect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.fill();
  return canvas.toDataURL();
}