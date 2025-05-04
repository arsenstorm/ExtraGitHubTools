// Next
import { NextResponse } from "next/server";

// Actions
import { getGitHubToken } from "@/actions/token/get";

export async function GET() {
	const { token, error } = await getGitHubToken();

	if (error) {
		return NextResponse.json(
			{
				error,
			},
			{
				status: 400,
			},
		);
	}

	return NextResponse.json({
		token,
	});
}
