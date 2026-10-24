import { error, info, setFailed, warning } from "@actions/core";
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
    // The log only prints the message, so it names the location itself
    const details =
      problem.message && problem.info
        ? `${problem.message} (${problem.info})`
        : problem.message || problem.info || "";
    log(`${problem.file}:${problem.startLine}: ${details}`, problem);
  }
  if (problems.length == 0) {
    info("PMD found no problems.");
    return;
  }
  const count_report =
    problems.length == 1
      ? "There was 1 problem."
      : `There were ${problems.length} problems.`;
  if (severity === "warning") {
    info(count_report);
  } else {
    setFailed(count_report);
  }
}
