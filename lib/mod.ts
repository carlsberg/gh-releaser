import { Octono } from "./deps.ts";

const octono = new Octono();

export interface OpenPullRequestOptions {
  owner: string;
  repo: string;
  base: string;
  head: string;
  title: string;
  body: string;
  label?: string;
}

export interface ClosePullRequestOptions {
  owner: string;
  repo: string;
  number: number;
}

export interface MergePullRequestOptions {
  owner: string;
  repo: string;
  number: number;
  commit: {
    title: string;
    message?: string;
  };
}

export interface FindPullRequestOptions {
  owner: string;
  repo: string;
  label: string;
}

export interface GetBranchOptions {
  owner: string;
  repo: string;
  branch: string;
}

export interface CreateBranchOptions {
  owner: string;
  repo: string;
  branch: string;
  sha: string;
}

export interface RenameBranchOptions {
  owner: string;
  repo: string;
  branch: string;
  newName: string;
}

export interface CreateReleaseOptions {
  owner: string;
  repo: string;
  name: string;
  body: string;
  draft: boolean;
  tag: string;
}

export interface GetReleaseByTagOptions {
  owner: string;
  repo: string;
  tag: string;
}

export interface UpdateReleaseOptions extends Partial<CreateReleaseOptions> {
  releaseID: number;
}

export async function openPullRequest(options: OpenPullRequestOptions) {
  const { owner, repo, base, head, title, body, label } = options;

  const resp = await octono.request("POST /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    base,
    head,
    title,
    body,
    headers: {
      authorization: `bearer ${await fetchGitHubToken()}`,
    },
  });

  const pr = await resp.json();

  if (label) {
    const addLabelsResp = await octono.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
      {
        owner,
        repo,
        issue_number: pr.number,
        labels: [label],
        headers: {
          authorization: `bearer ${await fetchGitHubToken()}`,
        },
      },
    );

    const labels = await addLabelsResp.json();

    pr.labels = labels;
  }

  return pr;
}

export async function closePullRequest(options: ClosePullRequestOptions) {
  const { owner, repo, number } = options;

  await octono.request("PATCH /repos/{owner}/{repo}/pulls/{pull_number}", {
    owner,
    repo,
    pull_number: number,
    state: "closed",
    headers: {
      authorization: `bearer ${await fetchGitHubToken()}`,
    },
  });
}

export async function mergePullRequest(options: MergePullRequestOptions) {
  const { owner, repo, number, commit } = options;

  await octono.request("PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge", {
    owner,
    repo,
    pull_number: number,
    commit_title: commit.title,
    commit_message: commit.message,
    headers: {
      authorization: `bearer ${await fetchGitHubToken()}`,
    },
  });
}

/* Searches open pull requests with a label */
export async function findPullRequests(options: FindPullRequestOptions) {
  const { owner, repo, label } = options;

  const resp = await octono.paginated("GET /search/issues", {
    q: `user:${owner} repo:${repo} label:${label} state:open`,
    headers: {
      authorization: `bearer ${await fetchGitHubToken()}`,
    },
  });

  const { items } = await resp.json();

  return items;
}

export async function createBranch(options: CreateBranchOptions) {
  const { owner, repo, branch, sha } = options;

  const resp = await octono.request("POST /repos/{owner}/{repo}/git/refs", {
    owner,
    repo,
    sha,
    ref: `heads/${branch}`,
    headers: {
      authorization: `bearer ${await fetchGitHubToken()}`,
    },
  });

  return await resp.json();
}

export async function getBranch(options: GetBranchOptions) {
  const { owner, repo, branch } = options;

  const resp = await octono.request(
    "GET /repos/{owner}/{repo}/branches/{branch}",
    {
      owner,
      repo,
      branch,
      headers: {
        authorization: `bearer ${await fetchGitHubToken()}`,
      },
    },
  );

  return await resp.json();
}

export async function renameBranch(options: RenameBranchOptions) {
  const { owner, repo, branch, newName } = options;

  const resp = await octono.request(
    // @ts-ignore: typings for this endpoint will be available
    // on the next Octono's release (0.0.6)
    "POST /repos/{owner}/{repo}/branches/{branch}/rename",
    {
      owner,
      repo,
      branch,
      newName,
      headers: {
        authorization: `bearer ${await fetchGitHubToken()}`,
      },
    },
  );

  return await resp.json();
}

export async function createRelease(options: CreateReleaseOptions) {
  const { owner, repo, name, body, draft, tag } = options;

  const resp = await octono.request("POST /repos/{owner}/{repo}/releases", {
    owner,
    repo,
    name,
    body,
    draft,
    tag_name: tag,
    headers: {
      authorization: `bearer ${await fetchGitHubToken()}`,
    },
  });

  return await resp.json();
}

export async function getReleaseByTag(options: GetReleaseByTagOptions) {
  const { owner, repo, tag } = options;

  const resp = await octono.request(
    "GET /repos/{owner}/{repo}/releases/tags/{tag}",
    {
      owner,
      repo,
      tag,
      headers: {
        authorization: `bearer ${await fetchGitHubToken()}`,
      },
    },
  );

  return await resp.json();
}

export async function updateRelease(options: UpdateReleaseOptions) {
  const { owner, repo, name, body, draft, tag, releaseID } = options;

  // @ts-ignore: typings for this endpoint will be available
  // on the next Octono's release (0.0.6)
  const resp = await octono.request("PATCH /repos/{owner}/{repo}/releases", {
    owner,
    repo,
    name,
    body,
    draft,
    tag_name: tag,
    release_id: releaseID,
    headers: {
      authorization: `bearer ${await fetchGitHubToken()}`,
    },
  });

  return await resp.json();
}

/* Fetches a GitHub token from the environment or GitHub CLI */
export async function fetchGitHubToken() {
  const token = Deno.env.get("GITHUB_TOKEN");

  if (token) {
    return token;
  }

  // if the token isn't available in the environment we
  // fetch it using the GitHub CLI
  const p = Deno.run({
    cmd: ["gh", "config", "get", "oauth_token", "-h", "github.com"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code } = await p.status();

  if (code !== 0) {
    throw new Error("failed to fetch GitHub token using GitHub CLI");
  }

  return new TextDecoder().decode(await p.output());
}
