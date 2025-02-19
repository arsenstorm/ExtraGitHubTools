import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
	appName: "Extra GitHub Tools",
	database: new Pool({
		connectionString: process.env.DATABASE_URL ?? "",
	}),
	user: {
		deleteUser: {
			enabled: true,
		},
	},
	socialProviders: {
		github: {
			clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
			scope: ["admin:org", "repo"],
		},
	},
	trustedOrigins: [
		// Production
		"https://extragithubtools.com",
		"https://extragithub.tools",

		// Development
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
	],
});
