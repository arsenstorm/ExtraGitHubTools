"use server";

import { checkSessionReturnToken } from "../check";

export async function transferRepositories({
  from,
  to,
  repositories,
}: {
  readonly from: string;
  readonly to: string;
  readonly repositories: string[];
}) {
  const githubToken = await checkSessionReturnToken();

  if (!githubToken) {
    return {
      token_expired: true, // return true anyway if there is no token
      is_error: true,
      error: "We couldn’t find your GitHub token or your session has expired. Please sign in again.",
      data: null,
    };
  }

  let promises = repositories.map((repo) => {
    return fetch(
      `https://api.github.com/repos/${from}/${repo}/transfer`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${githubToken}`,
        },
        body: JSON.stringify({
          new_owner: to,
        }),
      },
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to transfer ${repo}.`);
      }
      return response;
    });
  });

  try {
    let responses = await Promise.all(promises);

    return {
      token_expired: false,
      is_error: false,
      error: null,
      data: responses,
    };
  } catch (error) {
    let errorMessage = "An error occurred while transferring repositories.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      token_expired: false,
      is_error: true,
      error: errorMessage,
      data: null,
    };
  }
}
