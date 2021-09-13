import { yargs } from "./deps.ts";
import { version } from "../version.ts";

yargs()
  .scriptName("gh-releaser")
  .alias("h", "help")
  .version(version)
  .parse(Deno.args);