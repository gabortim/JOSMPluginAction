import { getInput, setFailed } from "@actions/core";
import { run as realRun } from "./pmd";
import { parseSeverity } from "./logProblems";

async function run(): Promise<void> {
  const pmdFile = getInput("file");
  const sourceDir = getInput("src");
  const severity = parseSeverity(getInput("severity"));
  realRun(sourceDir, pmdFile, severity);
}

run().catch((err) => setFailed(err));
