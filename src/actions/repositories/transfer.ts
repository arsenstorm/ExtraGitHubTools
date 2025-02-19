"use server";

export async function transferRepositories({
	token = "",
	from,
	to,
	repositories,
}: {
	readonly token?: string | null;
	readonly from: string;
	readonly to: string;
	readonly repositories: string[];
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

	const promises = repositories.map((repo) => {
		return fetch(`https://api.github.com/repos/${from}/${repo}/transfer`, {
			method: "POST",
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				new_owner: to,
			}),
		}).then((response) => {
			if (!response.ok) {
				throw new Error(`Failed to transfer ${repo}.`);
			}
			return response;
		});
	});

	try {
		const responses = await Promise.all(promises);

		const results = responses.map((response) => ({
			status: response.status,
			statusText: response.statusText,
			ok: response.ok,
		}));

		return {
			token_expired: false,
			is_error: false,
			error: null,
			data: results,
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
