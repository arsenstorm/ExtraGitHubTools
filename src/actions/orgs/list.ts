"use server";

export async function listOrganisations({
	token = "",
	exclude = null,
}: {
	readonly token?: string | null;
	readonly exclude?: string | null;
} = {}) {
	if (!token || token.length === 0) {
		return {
			token_expired: true, // return true anyway if there is no token
			is_error: true,
			error:
				"We couldn’t find your GitHub token or your session has expired. Please sign in again.",
			data: null,
		};
	}

	const user_response = fetch("https://api.github.com/user", {
		headers: {
			Accept: "application/vnd.github.v3+json",
			Authorization: `Bearer ${token}`,
		},
	});

	const orgs_response = fetch("https://api.github.com/user/orgs", {
		headers: {
			Accept: "application/vnd.github.v3+json",
			Authorization: `Bearer ${token}`,
		},
	});

	const response = await Promise.all([user_response, orgs_response]);

	const user = await response[0].json();
	const orgs = await response[1].json();

	const result = [
		{
			id: user.id,
			handle: user.login,
			avatar: user.avatar_url,
		},
		...orgs.map((org: any) => ({
			id: org.id,
			handle: org.login,
			avatar: org.avatar_url,
		})),
	];

	if (exclude) {
		return {
			token_expired: false,
			is_error: false,
			error: null,
			data: result.filter((org: any) => org.handle !== exclude),
		};
	}

	return {
		token_expired: false,
		is_error: false,
		error: null,
		data: result,
	};
}
