export function getMostActiveVisibleCell(): HTMLElement | null {
  const cells = Array.from(document.querySelectorAll<HTMLElement>("[data-github-cell]"));
  if (cells.length === 0) return null;

  // Simple heuristic: find highest level cell currently in viewport
  let highestLevel = -1;
  let bestCell: HTMLElement | null = null;

  for (const cell of cells) {
    const level = parseInt(cell.getAttribute("data-level") || "0", 10);
    if (level > highestLevel) {
      const rect = cell.getBoundingClientRect();
      // Check if in viewport horizontally
      if (rect.left >= 0 && rect.right <= window.innerWidth) {
        highestLevel = level;
        bestCell = cell;
      }
    }
    if (highestLevel === 4) break; // max possible
  }

  return bestCell || cells[cells.length - 1]; // Fallback to last cell
}

export function getHoveredContributionCell(): HTMLElement | null {
  const hovered = document.querySelector<HTMLElement>("[data-github-cell]:hover");
  return hovered;
}

export function getNearestContributionCell(x: number, y: number): HTMLElement | null {
  const cells = Array.from(document.querySelectorAll<HTMLElement>("[data-github-cell]"));
  if (cells.length === 0) return null;

  let minDistance = Infinity;
  let nearestCell: HTMLElement | null = null;

  for (const cell of cells) {
    const rect = cell.getBoundingClientRect();
    const cellCenterX = rect.left + rect.width / 2;
    const cellCenterY = rect.top + rect.height / 2;
    
    const distance = Math.sqrt(Math.pow(cellCenterX - x, 2) + Math.pow(cellCenterY - y, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearestCell = cell;
    }
  }

  return nearestCell;
}
