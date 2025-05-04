import { getGitHubToken } from "@/actions/token/get";
import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import os from "node:os";

const execAsync = promisify(exec);

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
		// Create a unique temporary directory for this clone
		const tempDir = path.join(os.tmpdir(), `git-fame-${uuidv4()}`);
		await fs.mkdir(tempDir, { recursive: true });

		console.log(`Cloning ${org}/${repo} into ${tempDir}...`);

		// Clone the repository with depth 1 to speed up the process
		const repoUrl = `https://${token}@github.com/${org}/${repo}.git`;
		await execAsync(`git clone --single-branch ${repoUrl} ${tempDir}`);

		// Get repository statistics
		const stats = await analyzeRepository(tempDir);

		// Clean up the temporary directory
		await fs.rm(tempDir, { recursive: true, force: true });

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

async function analyzeRepository(repoPath: string): Promise<RepoStats> {
	// Get list of all contributors with their commit counts
	const { stdout: contributorsOutput } = await execAsync(
		'git log --format=\'%ae|%an\' | sort | uniq -c | sort -nr',
		{ cwd: repoPath }
	);

	// Get total number of commits
	const { stdout: commitsOutput } = await execAsync(
		'git rev-list --count HEAD',
		{ cwd: repoPath }
	);
	const totalCommits = Number.parseInt(commitsOutput.trim(), 10);

	// Get total number of files
	const { stdout: filesOutput } = await execAsync(
		'git ls-files | wc -l',
		{ cwd: repoPath }
	);
	const totalFiles = Number.parseInt(filesOutput.trim(), 10);

	// Get total lines of code
	const { stdout: linesOutput } = await execAsync(
		'git ls-files | xargs wc -l 2>/dev/null || echo "0"',
		{ cwd: repoPath }
	);
	const totalLinesMatch = linesOutput.match(/\s*(\d+)\s+total/);
	const totalLines = totalLinesMatch ? Number.parseInt(totalLinesMatch[1], 10) : 0;

	// Parse contributors data
	const contributors: ContributorStats[] = [];
	let totalAdditions = 0;
	let totalDeletions = 0;

	const contributorLines = contributorsOutput
		.trim()
		.split('\n')
		.filter(line => line.trim() !== '');

	// Process each contributor
	for (const line of contributorLines) {
		const match = line.trim().match(/^\s*(\d+)\s+(.+?)\|(.+?)$/);
		if (match) {
			const commits = Number.parseInt(match[1], 10);
			const email = match[2].trim();
			const name = match[3].trim();

			// Get additions and deletions for this contributor
			const { stdout: authorChanges } = await execAsync(
				`git log --author="${email}" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2; } END { print add "|" subs "|" NR }'`,
				{ cwd: repoPath }
			);

			let additions = 0;
			let deletions = 0;
			let files = 0;

			if (authorChanges.trim()) {
				const [addStr, delStr, filesStr] = authorChanges.trim().split('|');
				additions = Number.parseInt(addStr, 10) || 0;
				deletions = Number.parseInt(delStr, 10) || 0;
				files = Number.parseInt(filesStr, 10) || 0;
			}

			totalAdditions += additions;
			totalDeletions += deletions;

			contributors.push({
				name,
				email,
				commits,
				additions,
				deletions,
				files,
				percentage: (commits / totalCommits) * 100,
			});
		}
	}

	// Sort contributors by number of commits
	contributors.sort((a, b) => b.commits - a.commits);

	return {
		totalCommits,
		totalFiles,
		totalLines,
		totalAdditions,
		totalDeletions,
		contributors,
	};
}
