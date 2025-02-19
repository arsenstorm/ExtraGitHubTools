// Next
import { NextResponse } from "next/server";
import { headers as _headers } from "next/headers";

// Auth
import { auth } from "@/auth";

// Database
import { Pool } from "pg";

export async function GET() {
	const headers = await _headers();

	const session = await auth.api.getSession({
		headers,
	});

	if (!session?.user?.id) {
		return NextResponse.json(
			{
				error: "Unauthorized.",
			},
			{
				status: 401,
			},
		);
	}

	const data = await auth.api.listUserAccounts({
		headers,
	});

	const account = data?.[0] ?? undefined;

	if (!account) {
		return NextResponse.json(
			{
				error: "No token.",
			},
			{
				status: 400,
			},
		);
	}

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL ?? "",
	});

	// get the token by making a call to the database
	const token = await pool.query(
		'SELECT "accessToken" FROM "account" WHERE id = $1 LIMIT 1;',
		[account?.id],
	);

	return NextResponse.json({
		token: token.rows[0].accessToken,
	});
}
