import { yargs } from "./deps.ts";
import { version } from "../version.ts";
import { startCommand } from "./cmd/start.ts";

export const DEFAULT_MAIN_BRANCH = "main";
export const DEFAULT_DEVELOP_BRANCH = "develop";

yargs()
  .scriptName("gh-releaser")
  .alias("h", "help")
  .command(
    "start <tag>",
    "starts a new release",
    (y: ReturnType<typeof yargs>) => {
      y.positional("tag", {
        type: "string",
        required: true,
        describe: "Tag to be released",
      });

      y.option("main-branch", {
        type: "string",
        describe: "Repository's main branch",
        default: DEFAULT_MAIN_BRANCH,
      });

      y.option("develop-branch", {
        type: "string",
        describe: "Repository's develop branch",
        default: DEFAULT_DEVELOP_BRANCH,
      });
    },
    startCommand,
  )
  .demandCommand(1)
  .version(version)
  .parse(Deno.args);
