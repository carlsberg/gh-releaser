import { getOwnerAndRepo, yargs } from "./deps.ts";
import { version } from "../version.ts";
import { startCommand } from "./cmd/start.ts";
import { prCommand } from "./cmd/pr.ts";

export const DEFAULT_MAIN_BRANCH = "main";
export const DEFAULT_DEVELOP_BRANCH = "develop";

const { owner, repo } = await getOwnerAndRepo();

yargs()
  .scriptName("gh-releaser")
  .alias("h", "help")
  .option("owner", {
    alias: "o",
    type: "string",
    default: owner,
    description: "Owner of the repository",
  })
  .option("repo", {
    alias: "r",
    type: "string",
    default: repo,
    description: "Name of the repository",
  })
  .command(
    "start <tag>",
    "Starts a new release",
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
  .command(
    "pr",
    "Shows the open release's Pull Request number",
    {},
    prCommand,
  )
  .demandCommand(1)
  .version(version)
  .parse(Deno.args);
