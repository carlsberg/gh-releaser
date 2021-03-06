import {
  createBranch,
  createRelease,
  getBranch,
  openPullRequest,
} from "../deps.ts";

export interface StartCommandArgs {
  owner: string;
  repo: string;
  tag: string;
  mainBranch: string;
  developBranch: string;
}

export async function startCommand(args: StartCommandArgs) {
  const {
    owner,
    repo,
    tag,
    mainBranch: mainBranchName,
    developBranch: developBranchName,
  } = args;

  // Create release branch
  const releaseBranchName = `release/${tag}`;

  const developBranch = await getBranch({
    owner,
    repo,
    branch: developBranchName,
  });

  await createBranch({
    owner,
    repo,
    branch: releaseBranchName,
    sha: developBranch.commit.sha!,
  });

  console.log(`Created release branch: ${releaseBranchName}`);

  // Create GitHub Release
  const release = await createRelease({
    owner,
    repo,
    tag,
    name: tag,
    body: "",
    draft: true,
  });

  console.log(`Created GitHub Release: ${release.html_url}`);

  // Create PulL Request
  const pr = await openPullRequest({
    owner,
    repo,
    title: `bump: release ${tag}`,
    body: `:bookmark: Created [${tag} release](${release.html_url})`,
    base: mainBranchName,
    head: releaseBranchName,
    label: "gh-releaser",
  });

  console.log(`Created Pull Request: ${pr.html_url}`);
  console.log("Done!");
}
