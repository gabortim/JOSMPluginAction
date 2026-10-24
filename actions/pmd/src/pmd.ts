import { debug, summary } from "@actions/core";
import { readFileSync } from "fs";
import { XMLParser } from "fast-xml-parser";
import { logProblems, Severity } from "./logProblems";
import { Problem } from "./problem";
import { formatSummary } from "./summary";

export { Problem, logProblems };

type Violation = {
  "@_ruleset": string;
  "@_rule": string;
  "@_begincolumn": string;
  "@_endcolumn": string;
  "@_beginline": string;
  "@_endline": string;
  "@_externalInfoUrl": string;
  "#text"?: string;
};
type FileData = {
  violation: Violation[];
  "@_name": string;
};

function parseFile(sourceDirectory: string, fileData: FileData): Problem[] {
  const file =
    (sourceDirectory.length > 0 && !sourceDirectory.endsWith("/")
      ? sourceDirectory + "/"
      : sourceDirectory) + fileData["@_name"].replace(/\\/g, "/");
  const violations = fileData["violation"];
  const problems: Problem[] = [];
  for (const violation of violations) {
    const title = violation["@_ruleset"] + "/" + violation["@_rule"];
    problems.push({
      file: file,
      title: title,
      startColumn: parseInt(violation["@_begincolumn"]),
      endColumn: parseInt(violation["@_endcolumn"]),
      startLine: parseInt(violation["@_beginline"]),
      endLine: parseInt(violation["@_endline"]),
      info: violation["@_externalInfoUrl"],
      message: violation["#text"],
    });
  }
  return problems;
}

export function parseData(
  sourceDirectory: string,
  data: string | Buffer,
): Problem[] {
  const alwaysArray = ["pmd.file", "pmd.file.violation"];
  const parser = new XMLParser({
    ignoreAttributes: false,
    isArray: (name, jpath) => {
      return typeof jpath === "string" && alwaysArray.includes(jpath);
    },
  });
  const parsed = parser.parse(data);
  const files = parsed["pmd"]["file"];
  let problems: Problem[] = [];
  if (files !== undefined && files !== null) {
    for (const file of files) {
      problems = problems.concat(parseFile(sourceDirectory, file));
    }
  }
  return problems;
}

export async function run(
  sourceDir: string,
  pmdFile: string,
  severity: Severity = "error",
) {
  const data = readFileSync(pmdFile);
  debug(data.toString());
  const problems = parseData(sourceDir, data);
  logProblems(problems, severity);
  if (problems.length > 0) {
    await summary.addRaw(formatSummary(problems, blobUrl())).write();
  }
}

function blobUrl(): string | undefined {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_SHA } = process.env;
  if (!GITHUB_SERVER_URL || !GITHUB_REPOSITORY || !GITHUB_SHA) {
    return undefined;
  }
  return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/blob/${GITHUB_SHA}`;
}
