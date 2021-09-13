import { findPullRequests } from "../deps.ts";

export async function prCommand() {
  const pulls = await findPullRequests({
    owner: "crqra",
    repo: "gh-releaser-test",
    label: "gh-releaser",
  });

  if (pulls!.length > 0) {
    console.log(`#${pulls![0].number}`);
  }
}
