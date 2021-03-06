import { getOwnerAndRepo, yargs } from "./deps.ts";
import { version } from "../version.ts";
import { closeCommand } from "./cmd/close.ts";
import { startCommand } from "./cmd/start.ts";
import { updateCommand } from "./cmd/update.ts";
import { prCommand } from "./cmd/pr.ts";

const DEFAULT_MAIN_BRANCH = "main";
const DEFAULT_DEVELOP_BRANCH = "develop";

let owner = Deno.env.get("OWNER");
let repo = Deno.env.get("REPO");

if (!owner || !repo) {
  const ownerAndRepo = await getOwnerAndRepo();

  owner = ownerAndRepo.owner;
  repo = ownerAndRepo.repo;
}

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
  .command("close", "Closes the open release", {
    "develop-branch": {
      type: "string",
      describe: "Repository's develop branch",
      default: DEFAULT_DEVELOP_BRANCH,
    },
    "skip-merge": {
      type: "boolean",
      describe: "Skips merge process from MAIN_BRAMCH to DEVELOP_BRANCH",
      default: false,
    },
  }, closeCommand)
  .command(
    "update <tag>",
    "Updates the open release's tag",
    {
      tag: {
        type: "string",
        required: true,
        describe: "The new tag",
      },
    },
    updateCommand,
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
