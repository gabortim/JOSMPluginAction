import { Problem } from "./problem";

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
}

function location(problem: Problem, blobUrl?: string): string {
  const text = `${problem.file}:${problem.startLine}`;
  if (blobUrl === undefined) {
    return escapeCell(text);
  }
  const lines =
    problem.endLine > problem.startLine
      ? `L${problem.startLine}-L${problem.endLine}`
      : `L${problem.startLine}`;
  return `[${escapeCell(text)}](${blobUrl}/${encodeURI(problem.file)}#${lines})`;
}

/**
 * Format all problems as a Markdown table for the job summary.
 * Annotations are capped by GitHub, the summary lists every problem.
 * @param problems The problems to list
 * @param blobUrl The base URL for file links, e.g. `https://github.com/owner/repo/blob/<sha>`
 */
export function formatSummary(problems: Problem[], blobUrl?: string): string {
  const rows = problems.map((problem) => {
    const rule =
      problem.info !== undefined && problem.info !== null
        ? `[${escapeCell(problem.title ?? "")}](${problem.info})`
        : escapeCell(problem.title ?? "");
    return `| ${location(problem, blobUrl)} | ${rule} | ${escapeCell(problem.message ?? "")} |`;
  });
  const count = `${problems.length} violation${problems.length == 1 ? "" : "s"}`;
  return [
    `## PMD: ${count}`,
    "",
    "| Location | Rule | Message |",
    "| --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}
