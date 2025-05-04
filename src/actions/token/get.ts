"use server";

// Next
import { headers as _headers } from "next/headers";

// Auth
import { auth } from "@/auth";

// Database
import { Pool } from "pg";

/**
 * Get a user's GitHub token from the database.
 */
export async function getGitHubToken(): Promise<{
	token: string | null;
	error: string | null;
}> {
	const headers = await _headers();

	const session = await auth.api.getSession({
		headers,
	});

	if (!session?.user?.id) {
		return {
			error: "Unauthorized.",
			token: null,
		};
	}

	const data = await auth.api.listUserAccounts({
		headers,
	});

	const account = data?.[0] ?? undefined;

	if (!account) {
		return {
			error: "No token.",
			token: null,
		};
	}

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL ?? "",
	});

	// get the token by making a call to the database
	const token = await pool.query(
		'SELECT "accessToken" FROM "account" WHERE id = $1 LIMIT 1;',
		[account?.id],
	);

	return {
		token: token.rows[0].accessToken,
		error: null,
	};
}
