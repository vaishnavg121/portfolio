export function readAtlasPalette(canvas: HTMLCanvasElement) {
  const probe = document.createElement("span");
  probe.hidden = true;
  canvas.parentElement?.append(probe);
  const sample = document.createElement("canvas");
  sample.width = sample.height = 1;
  const context = sample.getContext("2d");
  const color = (token: string) => {
    probe.style.color = "var(" + token + ")";
    const css = getComputedStyle(probe).color;
    if (!context) return { css, rgb: new Float32Array(3) };
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = css;
    context.fillRect(0, 0, 1, 1);
    const rgba = context.getImageData(0, 0, 1, 1).data;
    return { css, rgb: new Float32Array([rgba[0] / 255, rgba[1] / 255, rgba[2] / 255]) };
  };
  const palette = {
    shadow: color("--surface-elevated"), muted: color("--text-muted"),
    light: color("--text-primary"), accent: color("--accent"),
    petal: color("--accent-petal"), stone: color("--accent-stone"),
  };
  probe.remove();
  return palette;
}
