import { InitialSchema } from "../types";
import { Parser, Grammar, CompiledRules } from "nearley";

const atJsonParser = (grammar: CompiledRules, text: string): InitialSchema => {
  const parser = new Parser(Grammar.fromCompiled(grammar));
  parser.feed(text);
  if (parser.results.length > 1) {
    if (process.env.NODE_ENV === "test") {
      parser.results.forEach((r) => {
        console.log("RESULT");
        console.log(JSON.stringify(r));
        console.log("");
      });
    }
    throw new Error(
      `Failed to parse: Multiple results returned by grammar (${parser.results.length})`
    );
  }
  if (parser.results.length === 0) {
    throw new Error(`Failed to parse: Unexpected end of text`);
  }
  return parser.results[0];
};

export default atJsonParser;
