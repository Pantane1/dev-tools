export type FieldSpec = { min: number; max: number };

export const SPECS: FieldSpec[] = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12 },
  { min: 0, max: 6 },
];

export function parseField(input: string, spec: FieldSpec, isDow = false): { set: Set<number>; full: boolean } {
  const set = new Set<number>();
  const trimmed = input.trim();
  const full = trimmed === "*";
  const parts = trimmed.split(",");
  for (const part of parts) {
    let rangePart = part;
    let step = 1;
    if (part.includes("/")) {
      const split = part.split("/");
      rangePart = split[0] ?? "*";
      step = parseInt(split[1] ?? "1", 10);
      if (isNaN(step) || step < 1) throw new Error("Invalid step");
    }
    let start = spec.min;
    let end = spec.max;
    if (rangePart !== "*") {
      if (rangePart.includes("-")) {
        const split = rangePart.split("-");
        start = parseInt(split[0] ?? "", 10);
        end = parseInt(split[1] ?? "", 10);
      } else {
        start = end = parseInt(rangePart, 10);
      }
      if (isNaN(start) || isNaN(end)) throw new Error("Invalid value");
    }
    if (start < spec.min || end > spec.max) throw new Error("Out of range");
    if (start > end) throw new Error("Invalid range");
    for (let v = start; v <= end; v += step) {
      let val = v;
      if (isDow && val === 7) val = 0;
      set.add(val);
    }
  }
  if (set.size === 0) throw new Error("Empty field");
  return { set, full };
}

export function parseCron(expr: string) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error("Cron expression must have 5 fields");
  const fields = parts.map((p, i) => parseField(p, SPECS[i]!, i === 4));
  const domFull = fields[2]!.full;
  const dowFull = fields[4]!.full;
  return { fields, domFull, dowFull };
}

export function matches(date: Date, parsed: ReturnType<typeof parseCron>): boolean {
  const m = date.getMinutes();
  const h = date.getHours();
  const dom = date.getDate();
  const mon = date.getMonth() + 1;
  const dow = date.getDay();
  const { fields, domFull, dowFull } = parsed;
  if (!fields[0]!.set.has(m)) return false;
  if (!fields[1]!.set.has(h)) return false;
  if (!fields[3]!.set.has(mon)) return false;
  if (domFull || dowFull) {
    if (!domFull && !fields[2]!.set.has(dom)) return false;
    if (!dowFull && !fields[4]!.set.has(dow)) return false;
  } else {
    if (!fields[2]!.set.has(dom) && !fields[4]!.set.has(dow)) return false;
  }
  return true;
}

export function nextRuns(expr: string, count: number, from: Date = new Date()): Date[] {
  const parsed = parseCron(expr);
  const results: Date[] = [];
  const cursor = new Date(from);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  const limit = 366 * 24 * 60;
  for (let i = 0; i < limit && results.length < count; i++) {
    if (matches(cursor, parsed)) results.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results;
}

export function explain(expr: string): string {
  try {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return "Invalid expression.";
    const [min, hr, dom, mon, dow] = parts;
    const pieces: string[] = [];
    pieces.push(min === "*" ? "every minute" : `minute ${min}`);
    pieces.push(hr === "*" ? "of every hour" : `of hour ${hr}`);
    if (dom !== "*") pieces.push(`on day-of-month ${dom}`);
    if (mon !== "*") pieces.push(`in month ${mon}`);
    if (dow !== "*") pieces.push(`on weekday ${dow}`);
    return pieces.join(" ");
  } catch {
    return "Invalid expression.";
  }
}