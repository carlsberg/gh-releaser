import {
  findPullRequests,
  getDraftReleaseByTag,
  getPullRequest,
  mergeBranch,
  MergeMethod,
  mergePullRequest,
  updateRelease,
} from "../deps.ts";

export interface CloseCommandArgs {
  owner: string;
  repo: string;
  developBranch: string;
}

export async function closeCommand(args: CloseCommandArgs) {
  const { owner, repo, developBranch } = args;

  const prs = await findPullRequests({
    owner,
    repo,
    label: "gh-releaser",
    state: "open",
  });

  if (!prs || prs.length === 0) {
    throw new Error("couldn't find an open release Pull Request");
  }

  // Get the full Pull Request object
  const pr = await getPullRequest({ owner, repo, number: prs[0].number });

  // Get current release branch name
  const { head: { ref: releaseBranchName }, base: { ref: mainBranchName } } =
    pr;

  const [_, tag] = releaseBranchName.split("/");

  const release = await getDraftReleaseByTag({ owner, repo, tag });

  if (!release) {
    throw new Error(`couldn't find a draft release for tag ${tag}`);
  }

  await mergePullRequest({
    owner,
    repo,
    number: pr.number,
    mergeMethod: MergeMethod.Rebase,
    commit: { title: `release: ${tag}` },
  });

  console.log(`Merged Pull Request: #${pr.number}`);

  await updateRelease({
    owner,
    repo,
    releaseID: release.id,
    draft: false,
  });

  console.log(`Published GitHub Release (${release.id}): ${release.html_url}`);

  mergeBranch({
    base: developBranch,
    head: mainBranchName,
    owner: owner,
    repo: repo,
  });

  console.log(`Synced ${mainBranchName} -> ${developBranch}`);
  console.log("Done!");
}
