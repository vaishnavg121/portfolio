import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarDate, calendarKeyIndex, contributionAnchor, contributionColumns, parsePublicCalendar } from "../src/lib/github-calendar.ts";

test("public GitHub cells are sorted, grouped by UTC week and counted from source tooltips", () => {
  const cell = (id, date, level, count) => `<td id="contribution-day-component-${id}" data-date="${date}" data-level="${level}"></td>
    <tool-tip for="contribution-day-component-${id}">${count} contributions on the date.</tool-tip>`;
  const result = parsePublicCalendar(cell("sun", "2026-11-22", 2, "4") + cell("sat", "2026-11-21", 0, "No") + cell("mon", "2026-11-23", 4, "1,024"));
  assert.deepEqual(result.grid.map(week => week.map(day => day.date)), [["2026-11-21"], ["2026-11-22", "2026-11-23"]]);
  assert.equal(result.totalContributions, 1028);
  assert.equal(result.mostActiveDay.count, 1024);
  assert.equal(calendarDate("2026-11-22").getUTCDay(), 0);
});

test("missing counts fail closed and keyboard movement is bounded", () => {
  assert.equal(parsePublicCalendar('<td data-date="2026-11-22" id="contribution-day-component-1-0" data-level="1">'), null);
  assert.equal(calendarKeyIndex(2, 12, "ArrowLeft"), 0);
  assert.equal(calendarKeyIndex(3, 12, "ArrowRight"), 10);
  assert.equal(calendarKeyIndex(11, 12, "ArrowDown"), 11);
  assert.equal(calendarKeyIndex(4, 12, "End"), 11);
  assert.equal(calendarKeyIndex(4, 12, "Tab"), null);
});

test("sculpture preserves partial weeks, actual dates and zero days", () => {
  const friday = { date: "2026-11-20", count: 0, level: 0 };
  const sunday = { date: "2026-11-22", count: 4, level: 1 };
  const monday = { date: "2026-11-23", count: 16, level: 3 };
  const peak = { date: "2026-11-24", count: 64, level: 4 };
  const columns = contributionColumns([[friday], [sunday, monday, peak]]);
  assert.deepEqual(columns.map(({day, x, z}) => [day, x, z]), [[friday, 0, 5], [sunday, 1, 0], [monday, 1, 1], [peak, 1, 2]]);
  assert.ok(columns[0].height > 0);
  assert.deepEqual(columns.map(({intensity}) => intensity), [0, .25, .5, 1]);
  assert.ok(contributionAnchor(columns[3]).y < 0);
  assert.deepEqual(contributionColumns([]), []);
});
