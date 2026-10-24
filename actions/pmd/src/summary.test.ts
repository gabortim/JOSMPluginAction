import { describe, expect, test } from "@jest/globals";
import { formatSummary } from "./summary";

const problem = {
  file: "src/org/openstreetmap/josm/actions/JoinAreasAction.java",
  startColumn: 23,
  endColumn: 26,
  startLine: 1349,
  endLine: 1349,
  title: "Best Practices/UnusedLocalVariable",
  info: "https://docs.pmd-code.org/rules#unusedlocalvariable",
  message: "Avoid unused local variables such as 'spec'.",
};

describe("Test action/formatSummary", function () {
  test("Lists every problem with a link", () => {
    const summary = formatSummary(
      [problem, { ...problem, startLine: 10, endLine: 12 }],
      "https://github.com/JOSM/josm/blob/abc",
    );
    expect(summary).toContain("## PMD: 2 violations");
    expect(summary).toContain(
      "| [src/org/openstreetmap/josm/actions/JoinAreasAction.java:1349](https://github.com/JOSM/josm/blob/abc/src/org/openstreetmap/josm/actions/JoinAreasAction.java#L1349)" +
        " | [Best Practices/UnusedLocalVariable](https://docs.pmd-code.org/rules#unusedlocalvariable)" +
        " | Avoid unused local variables such as 'spec'. |",
    );
    expect(summary).toContain("JoinAreasAction.java#L10-L12)");
  });
  test("Plain location without a base URL", () => {
    const summary = formatSummary([problem]);
    expect(summary).toContain("## PMD: 1 violation\n");
    expect(summary).toContain(
      "| src/org/openstreetmap/josm/actions/JoinAreasAction.java:1349 |",
    );
  });
  test("Escapes table syntax in messages", () => {
    const summary = formatSummary([
      { ...problem, message: "a | b\n  c", info: undefined },
    ]);
    expect(summary).toContain(
      "| Best Practices/UnusedLocalVariable | a \\| b c |",
    );
  });
});
