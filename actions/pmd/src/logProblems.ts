import { error, setFailed, warning } from "@actions/core";
import { Problem } from "./problem";

/** How problems are reported: `error` fails the step, `warning` does not. */
export type Severity = "error" | "warning";

export function parseSeverity(value: string): Severity {
  if (value === "" || value === "error") {
    return "error";
  }
  if (value === "warning") {
    return "warning";
  }
  throw new Error(
    `Unknown severity '${value}', expected 'error' or 'warning'.`,
  );
}

export function logProblems(
  problems: Problem[],
  severity: Severity = "error",
): void {
  const log = severity === "warning" ? warning : error;
  for (const problem of problems) {
    log(
      problem.info !== undefined && problem.info !== null ? problem.info : "",
      problem,
    );
  }
  if (severity === "warning") {
    return;
  }
  if (problems.length == 1) {
    setFailed(`There was ${problems.length} problem.`);
  } else if (problems.length > 0) {
    setFailed(`There were ${problems.length} problems.`);
  }
}
