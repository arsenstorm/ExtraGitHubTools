"use server";

export async function listRepositories({
	token = "",
	account,
}: {
	readonly token?: string | null;
	readonly account: string;
}) {
	if (!token || token.length === 0) {
		return {
			token_expired: true, // return true anyway if there is no token
			is_error: true,
			error:
				"We couldn’t find your GitHub token or your session has expired. Please sign in again.",
			data: null,
		};
	}

	const org_repos = fetch(`https://api.github.com/orgs/${account}/repos`, {
		headers: {
			Accept: "application/vnd.github.v3+json",
			Authorization: `Bearer ${token}`,
		},
	});

	const user_repos = fetch(`https://api.github.com/users/${account}/repos`, {
		headers: {
			Accept: "application/vnd.github.v3+json",
			Authorization: `Bearer ${token}`,
		},
	});

	const response = await Promise.all([org_repos, user_repos]);

	// if there are org repos, add them to the list and DON'T add user repos, otherwise add user repos
	const org_repos_json = await response[0].json();

	if (org_repos_json.length > 0) {
		return {
			token_expired: false,
			is_error: false,
			error: null,
			data: org_repos_json,
		};
	}

	const user_repos_json = await response[1].json();

	return {
		token_expired: false,
		is_error: false,
		error: null,
		data: user_repos_json,
	};
}
