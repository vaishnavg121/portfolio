export function readAtlasPalette(canvas: HTMLCanvasElement) {
  const theme = getComputedStyle(canvas);
  const sample = document.createElement("canvas");
  sample.width = sample.height = 1;
  const context = sample.getContext("2d");
  const color = (token: string) => {
    const css = theme.getPropertyValue(token).trim();
    if (!context) return { css, rgb: new Float32Array(3) };
    context.fillStyle = css;
    context.fillRect(0, 0, 1, 1);
    const rgba = context.getImageData(0, 0, 1, 1).data;
    return { css, rgb: new Float32Array([rgba[0] / 255, rgba[1] / 255, rgba[2] / 255]) };
  };
  return {
    shadow: color("--surface-elevated"), muted: color("--text-muted"),
    light: color("--text-primary"), accent: color("--accent"),
  };
}
