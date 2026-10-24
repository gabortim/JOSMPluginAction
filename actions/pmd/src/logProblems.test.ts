import { describe, expect, jest, test } from "@jest/globals";
import * as core from "@actions/core";
import { logProblems, parseSeverity } from "./logProblems";

const problem = {
  file: "org/openstreetmap/josm/actions/JoinAreasAction.java",
  startColumn: 23,
  endColumn: 26,
  startLine: 1349,
  endLine: 1349,
  title: "Best Practices/UnusedLocalVariable",
  info: "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
};

describe("Test action/logProblems", function () {
  test("Simple logging", () => {
    const log = jest.spyOn(core, "error");
    const failed = jest.spyOn(core, "setFailed").mockImplementation(() => {});
    logProblems([problem]);
    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith(
      "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
      problem,
    );
    expect(failed).toBeCalledWith("There was 1 problem.");
  });
  test("Warning severity does not fail", () => {
    const log = jest.spyOn(core, "warning");
    const errorLog = jest.spyOn(core, "error");
    const failed = jest.spyOn(core, "setFailed").mockImplementation(() => {});
    logProblems([problem, problem], "warning");
    expect(log).toBeCalledTimes(2);
    expect(log).toBeCalledWith(
      "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
      problem,
    );
    expect(errorLog).not.toBeCalled();
    expect(failed).not.toBeCalled();
  });
});

describe("Test action/parseSeverity", function () {
  test("Defaults to error", () => {
    expect(parseSeverity("")).toBe("error");
    expect(parseSeverity("error")).toBe("error");
    expect(parseSeverity("warning")).toBe("warning");
  });
  test("Rejects unknown values", () => {
    expect(() => parseSeverity("warn")).toThrow("Unknown severity 'warn'");
  });
});
