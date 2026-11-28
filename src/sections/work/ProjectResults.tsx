import { expenseExample } from "../research-studio/markets-math";
import "./technical-flow.css";

export function ImdResult({ target }: { target:"range"|"cloud" }) {
  const range = target === "range";
  return (
    <table className="case-metrics">
      <caption>{range ? "Reported optical-range result" : "Reported cloud-base result"}</caption>
      <thead><tr><th scope="col">Model</th><th scope="col">Prediction target</th><th scope="col">R²</th>{range && <th scope="col">RMSE</th>}</tr></thead>
      <tbody><tr><th scope="row">{range ? "XGBoost" : "GRU"}</th><td>{range ? "Meteorological Optical Range" : "Cloud Base Height"}</td>
        <td data-number>{range ? "0.645" : "0.99"}</td>{range && <td data-number>1,655.76 m</td>}</tr></tbody>
    </table>
  );
}

const relationships = [
  ["Visibility and vertical visibility", .62],
  ["Visibility and temperature", .58],
  ["Visibility and pressure", -.49],
  ["Temperature and humidity", -.59],
  ["Humidity and dew point", .74],
  ["Dew point and pressure", -.60],
  ["Pressure and wind speed", -.51],
] as const;

export function ImdCorrelations() {
  return (
    <table className="case-metrics">
      <caption>Selected reported correlations</caption>
      <thead><tr><th scope="col">Weather observations</th><th scope="col">−1 to +1</th><th scope="col">Coefficient</th></tr></thead>
      <tbody>
        {relationships.map(([pair, value]) => (
          <tr key={pair}><th scope="row">{pair}</th>
            <td aria-hidden><span className="correlation-track"><span style={{
              left:((value<0 ? 1+value : 1)*50)+"%",width:Math.abs(value)*50+"%",
              background:value<0 ? "var(--accent-mauve)" : "var(--accent-stone)",
            }}/></span></td>
            <td data-number>{(value<0 ? "−" : "+")+Math.abs(value).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const amountFormat = new Intl.NumberFormat("en-IN");

export function SpenzaLedger() {
  const {total, credits}=expenseExample;
  const balance=credits.reduce<number>((amount,credit)=>amount+credit,-total);
  return (
    <table className="case-metrics">
      <caption>Illustrative expense split</caption>
      <thead><tr><th scope="col">Entry</th><th scope="col">Minor units</th></tr></thead>
      <tbody>
        <tr><th scope="row">Expense</th><td data-number>−{amountFormat.format(total)}</td></tr>
        {credits.map((amount,index)=><tr key={index}><th scope="row">Participant {index+1}</th><td data-number>+{amountFormat.format(amount)}</td></tr>)}
      </tbody>
      <tfoot><tr><th scope="row">Ledger balance</th><td data-number>{amountFormat.format(balance)}</td></tr></tfoot>
    </table>
  );
}
