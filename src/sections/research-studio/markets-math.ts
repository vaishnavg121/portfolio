const strike = 100;
const entrySpot = 100;
const entryYears = .5;
const entryVolatility = .22;

export const normalDensity = (z: number) => Math.exp(-.5 * z * z) / Math.sqrt(2 * Math.PI);

function normalCdf(z: number) {
  // Abramowitz and Stegun 26.2.17. The pricing model uses a zero interest rate.
  const t = 1 / (1 + .2316419 * Math.abs(z));
  const area = normalDensity(z) * t * (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z < 0 ? area : 1 - area;
}

function putValue(spot: number, years: number, volatility: number) {
  const intrinsic = Math.max(0, strike - spot);
  if (years <= 0 || volatility <= 0) return intrinsic;
  const deviation = volatility * Math.sqrt(years);
  const d1 = Math.log(spot / strike) / deviation + deviation / 2;
  const d2 = d1 - deviation;
  return Math.max(intrinsic, strike * normalCdf(-d2) - spot * normalCdf(-d1));
}

const initialCost = entrySpot + putValue(entrySpot, entryYears, entryVolatility);

export const protectedSharePnl = (spot: number, years: number, volatility: number) => spot + putValue(spot, years, volatility) - initialCost;

export const normalLossTail = {
  probability: .05,
  threshold: 1.6448536269514722,
  conditionalMean: normalDensity(1.6448536269514722) / .05,
} as const;

export const expenseExample = { total: 1200, credits: [500, 400, 300] } as const;
