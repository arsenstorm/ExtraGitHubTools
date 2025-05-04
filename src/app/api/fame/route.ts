import { getGitHubToken } from "@/actions/token/get";
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

// Define interfaces for our response data
interface ContributorStats {
	name: string;
	email: string;
	commits: number;
	additions: number;
	deletions: number;
	files: number;
	percentage: number;
}

interface RepoStats {
	totalCommits: number;
	totalFiles: number;
	totalLines: number;
	totalAdditions: number;
	totalDeletions: number;
	contributors: ContributorStats[];
}

export async function GET(request: Request) {
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

	const { searchParams } = new URL(request.url);
	const { org, repo } = Object.fromEntries(searchParams.entries());

	if (!org || !repo) {
		return NextResponse.json(
			{
				error: "Missing required parameters: org and repo",
			},
			{
				status: 400,
			},
		);
	}

	try {
		// Initialize Octokit with the user's token
		const octokit = new Octokit({ auth: token });

		// Get repository statistics
		const stats = await analyzeRepositoryWithAPI(octokit, org, repo);

		return NextResponse.json(stats);
	} catch (err) {
		console.error("Error processing repository:", err);
		return NextResponse.json(
			{
				error: `Failed to analyze repository: ${err instanceof Error ? err.message : String(err)}`,
			},
			{
				status: 500,
			},
		);
	}
}

async function analyzeRepositoryWithAPI(
	octokit: Octokit,
	owner: string,
	repo: string,
): Promise<RepoStats> {
	// Get repository stats
	const repoInfo = await octokit.repos.get({ owner, repo });

	// Get contributors
	const { data: contributorsData } = await octokit.repos.getContributorsStats({
		owner,
		repo,
	});

	// If GitHub returns 202, it means the stats are being calculated
	// We need to wait and retry
	if (!contributorsData || !Array.isArray(contributorsData)) {
		// Wait 2 seconds and try again
		await new Promise((resolve) => setTimeout(resolve, 2000));
		return analyzeRepositoryWithAPI(octokit, owner, repo);
	}

	// Get total commits from all contributors
	const totalCommits = contributorsData.reduce(
		(sum: number, contributor: any) => {
			return sum + (contributor.total || 0);
		},
		0,
	);

	// We'll implement a better way to count files
	// First, let's get the default branch
	const defaultBranch = repoInfo.data.default_branch;

	// Get the tree of the repository with recursive=true to get all files
	const { data: treeData } = await octokit.git.getTree({
		owner,
		repo,
		tree_sha: defaultBranch,
		recursive: "1",
	});

	// Count only files (not directories)
	const totalFiles = treeData.tree.filter(
		(item) => item.type === "blob",
	).length;

	// Process contributors data
	const contributors: ContributorStats[] = [];
	let totalAdditions = 0;
	let totalDeletions = 0;
	let totalLines = 0;

	// TypeScript type assertion to ensure contributorsData is treated as an array
	for (const contributor of contributorsData as any[]) {
		if (!contributor.author) continue;

		const commits = contributor.total || 0;
		let additions = 0;
		let deletions = 0;
		let files = 0;

		// Sum up weekly stats
		for (const week of contributor.weeks || []) {
			additions += week.a || 0;
			deletions += week.d || 0;
			if (week.c > 0) files += 1; // This is an approximation
		}

		totalAdditions += additions;
		totalDeletions += deletions;

		// Get user details
		const { data: userData } = await octokit.users.getByUsername({
			username: contributor.author.login,
		});

		contributors.push({
			name: userData.name || contributor.author.login,
			email:
				userData.email ||
				`${contributor.author.login}@users.noreply.github.com`,
			commits,
			additions,
			deletions,
			files,
			percentage: totalCommits > 0 ? (commits / totalCommits) * 100 : 0,
		});
	}

	// Sort contributors by number of commits
	contributors.sort((a, b) => b.commits - a.commits);

	// Total lines is additions - deletions (approximation)
	totalLines = totalAdditions - totalDeletions;
	if (totalLines < 0) totalLines = 0;

	return {
		totalCommits,
		totalFiles,
		totalLines,
		totalAdditions,
		totalDeletions,
		contributors,
	};
}
