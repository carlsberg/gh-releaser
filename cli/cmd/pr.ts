import { findPullRequests } from "../deps.ts";

export interface PRCommandArgs {
  owner: string;
  repo: string;
}

export async function prCommand(args: PRCommandArgs) {
  const { owner, repo } = args;

  const pulls = await findPullRequests({
    owner,
    repo,
    label: "gh-releaser",
  });

  if (pulls!.length > 0) {
    console.log(pulls![0].number);
  }
}
