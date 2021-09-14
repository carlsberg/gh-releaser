import {
  createRelease,
  findPullRequests,
  getPullRequest,
  openPullRequest,
  renameBranch,
} from "../deps.ts";

export interface UpdateCommandArgs {
  owner: string;
  repo: string;
  tag: string;
}

export async function updateCommand(args: UpdateCommandArgs) {
  const { owner, repo, tag } = args;

  const prs = await findPullRequests({
    owner,
    repo,
    label: "gh-releaser",
  });

  if (!prs || prs.length === 0) {
    throw new Error("couldn't find an open release Pull Request");
  }

  // Get the full Pull Request object
  const pr = await getPullRequest({ owner, repo, number: prs[0].number });

  // Get current release branch name
  const { head: { ref: currentReleaseBranchName } } = pr;

  const [_, currentTag] = currentReleaseBranchName.split("/");

  if (!currentTag) {
    throw new Error("failed to fetch current tag from the release branch name");
  }

  const newReleaseBranchName = `release/${tag}`;

  await renameBranch({
    owner,
    repo,
    branch: currentReleaseBranchName,
    newName: newReleaseBranchName,
  });

  console.log(
    `Renamed branch: ${currentReleaseBranchName} -> ${newReleaseBranchName}`,
  );

  console.log(`Closed Pull Request: #${pr.number}`);

  // Create new GitHub Release for the new tag
  // TODO(@crqra): maybe delete previous release?
  const release = await createRelease({
    owner,
    repo,
    tag,
    name: tag,
    body: "",
    draft: true,
  });

  console.log(`Created GitHub Release: ${release.html_url}`);

  // When branch is renamed any open PRs are automatically
  // closed, so we have to recreate it
  const newPR = await openPullRequest({
    owner,
    repo,
    title: `Release ${tag}`,
    body: `:bookmark: Created [${tag} release](${release.html_url})`,
    base: pr.base.ref,
    head: newReleaseBranchName,
    label: "gh-releaser",
  });

  console.log(`Created Pull Request: ${newPR.html_url}`);
  console.log("Done!");
}
