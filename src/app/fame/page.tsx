"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { listOrganisations } from "@/actions/orgs/list";
import { listRepositories } from "@/actions/repositories/list";
import { useEffect, useState } from "react";
import PageHeading from "@/components/PageHeading";
import { Strong, Text, TextLink } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import Image from "next/image";
import RequireSignIn from "@/components/RequireSignIn";
import { toast } from "sonner";
import { useAuth } from "../providers";
import { useQueryState } from "nuqs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

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

export default function Fame() {
	const { token } = useAuth();
	const [org, setOrg] = useQueryState("org");
	const [repo, setRepo] = useQueryState("repo");

	const isSignedIn = token && token.length > 0;

	return (
		<div className="flex flex-col justify-center h-full">
			<PageHeading
				title="Commit Fame"
				description="See how your commits compare to your colleagues and who's doing more."
			/>

			{!org && (
				<>
					<Text>Select the organization or user account to analyze.</Text>
					<Divider className="my-6" />
					{isSignedIn ? <OrganizationsList /> : <RequireSignIn />}
				</>
			)}

			{org && !repo && (
				<>
					<Text>
						Select a repository from <Strong>{org}</Strong> to analyze.
					</Text>
					<Divider className="my-6" />
					{isSignedIn ? <RepositoriesList org={org} /> : <RequireSignIn />}
				</>
			)}

			{org &&
				repo &&
				(isSignedIn ? (
					<RepoAnalysis org={org} repo={repo} />
				) : (
					<RequireSignIn />
				))}
		</div>
	);
}

function OrganizationsList() {
	const { token } = useAuth();
	const [orgs, setOrgs] = useState<any[] | null>(null);
	const [_, setOrg] = useQueryState("org");

	useEffect(() => {
		async function getListOfOrganizations() {
			const response = await listOrganisations({
				token: token ?? "",
			});
			if (response.token_expired === true) {
				toast.error("Session expired. Please sign in again.");
				return;
			}

			if (response.is_error === true) {
				console.error(response.error);
				toast.error(
					response?.error ?? "Failed to fetch organizations. Please try again.",
				);
			} else {
				setOrgs(response.data);
			}
		}

		getListOfOrganizations();
	}, [token]);

	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableHeader>ID</TableHeader>
					<TableHeader>Avatar</TableHeader>
					<TableHeader>Name</TableHeader>
				</TableRow>
			</TableHead>
			<TableBody>
				{orgs ? (
					orgs?.map((org) => (
						<TableRow
							key={org.handle}
							className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
							onClick={() => setOrg(org.handle)}
						>
							<TableCell className="font-medium">{org.id}</TableCell>
							<TableCell>
								<Image
									src={org.avatar}
									alt={org.handle}
									className="size-8 rounded-full"
									unoptimized
									width={32}
									height={32}
								/>
							</TableCell>
							<TableCell>
								<Text>{org.handle}</Text>
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={3} className="text-center">
							No GitHub Accounts found.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

function RepositoriesList({ org }: { org: string }) {
	const { token } = useAuth();
	const [repos, setRepos] = useState<any[] | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [_, setRepo] = useQueryState("repo");

	useEffect(() => {
		async function getListOfRepositories() {
			setIsLoading(true);
			const response = await listRepositories({
				account: org,
				token: token ?? "",
			});
			if (response.token_expired === true) {
				toast.error("Session expired. Please sign in again.");
				setIsLoading(false);
				return;
			}

			if (response.is_error === true) {
				console.error(response.error);
				toast.error(
					response?.error ?? "Failed to fetch repositories. Please try again.",
				);
			} else {
				setRepos(response.data);
			}
			setIsLoading(false);
		}

		getListOfRepositories();
	}, [org, token]);

	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableHeader>ID</TableHeader>
					<TableHeader>Name</TableHeader>
					<TableHeader>Full Name</TableHeader>
					<TableHeader>Actions</TableHeader>
				</TableRow>
			</TableHead>
			<TableBody>
				{!isLoading && repos ? (
					repos?.map((repo) => (
						<TableRow
							key={repo.id}
							className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
							onClick={() => setRepo(repo.name)}
						>
							<TableCell className="font-medium">{repo.id}</TableCell>
							<TableCell>
								<Text>{repo.name}</Text>
							</TableCell>
							<TableCell>
								<Text>{repo.full_name}</Text>
							</TableCell>
							<TableCell>
								<Text>
									<TextLink href={repo.html_url} target="_blank">
										View on GitHub
									</TextLink>
								</Text>
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={4} className="text-center">
							{isLoading ? "Loading..." : "No repositories found."}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

function RepoAnalysis({ org, repo }: { org: string; repo: string }) {
	const [stats, setStats] = useState<RepoStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchRepoStats() {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch(`/api/fame?org=${org}&repo=${repo}`);
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to analyze repository");
				}

				const data = await response.json();
				setStats(data);
			} catch (err) {
				console.error("Error fetching repository stats:", err);
				setError(
					err instanceof Error ? err.message : "An unknown error occurred",
				);
				toast.error(
					err instanceof Error ? err.message : "Failed to analyze repository",
				);
			} finally {
				setIsLoading(false);
			}
		}

		fetchRepoStats();
	}, [org, repo]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12 space-y-4">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-zinc-100" />
				<Text className="text-lg font-medium">Analyzing repository...</Text>
				<Text className="text-sm text-zinc-500">
					This may take a moment for larger repositories
				</Text>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12 space-y-4">
				<div className="rounded-full h-12 w-12 bg-red-100 dark:bg-red-900 flex items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6 text-red-600 dark:text-red-300"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>
				<Text className="text-lg font-medium text-red-600 dark:text-red-400">
					Analysis Failed
				</Text>
				<Text className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md text-center">
					{error}
				</Text>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="flex flex-col items-center justify-center py-12 space-y-4">
				<div className="rounded-full h-12 w-12 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6 text-zinc-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<Text className="text-lg font-medium">No Data Available</Text>
				<Text className="text-sm text-zinc-500">
					Could not retrieve repository statistics
				</Text>
			</div>
		);
	}

	// Calculate total changes for visualization
	const totalChanges = stats.totalAdditions + stats.totalDeletions;

	return (
		<div className="space-y-8">
			{/* Repository Overview */}
			<Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
				<CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
					<CardTitle>Repository Overview</CardTitle>
					<CardDescription>
						Summary statistics for {org}/{repo}
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<div className="grid grid-cols-2 md:grid-cols-4">
						<div className="p-6 border-b border-r border-zinc-200 dark:border-zinc-800">
							<Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Total Commits
							</Text>
							<Text className="text-3xl font-bold mt-2">
								{stats.totalCommits.toLocaleString()}
							</Text>
						</div>
						<div className="p-6 border-b border-r border-zinc-200 dark:border-zinc-800">
							<Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Files
							</Text>
							<Text className="text-3xl font-bold mt-2">
								{stats.totalFiles.toLocaleString()}
							</Text>
						</div>
						<div className="p-6 border-b border-r border-zinc-200 dark:border-zinc-800">
							<Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Lines of Code
							</Text>
							<Text className="text-3xl font-bold mt-2">
								{stats.totalLines.toLocaleString()}
							</Text>
						</div>
						<div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
							<Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Contributors
							</Text>
							<Text className="text-3xl font-bold mt-2">
								{stats.contributors.length.toLocaleString()}
							</Text>
						</div>
						<div className="p-6 col-span-2 border-r border-b md:border-b-0 border-zinc-200 dark:border-zinc-800">
							<Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Lines Added
							</Text>
							<Text className="text-3xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
								+{stats.totalAdditions.toLocaleString()}
							</Text>
						</div>
						<div className="p-6 col-span-2">
							<Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								Lines Deleted
							</Text>
							<Text className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">
								-{stats.totalDeletions.toLocaleString()}
							</Text>
						</div>
					</div>

					{/* Code Changes Visualization */}
					{totalChanges > 0 && (
						<div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
							<Text className="text-sm font-medium mb-2">
								Code Changes Distribution
							</Text>
							<div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-emerald-500 dark:bg-emerald-600"
									style={{
										width: `${(stats.totalAdditions / totalChanges) * 100}%`,
										float: "left",
									}}
								/>
								<div
									className="h-full bg-red-500 dark:bg-red-600"
									style={{
										width: `${(stats.totalDeletions / totalChanges) * 100}%`,
										float: "left",
									}}
								/>
							</div>
							<div className="flex justify-between mt-2 text-xs text-zinc-500">
								<div className="flex items-center">
									<div className="w-3 h-3 rounded-full bg-emerald-500 mr-1" />
									Additions (
									{((stats.totalAdditions / totalChanges) * 100).toFixed(1)}%)
								</div>
								<div className="flex items-center">
									<div className="w-3 h-3 rounded-full bg-red-500 mr-1" />
									Deletions (
									{((stats.totalDeletions / totalChanges) * 100).toFixed(1)}%)
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Contributors */}
			<Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
				<CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
					<CardTitle>Contributors</CardTitle>
					<CardDescription>Contribution breakdown by developer</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{stats.contributors.map((contributor, index) => (
						<div
							key={`${contributor.email}-${contributor.name}`}
							className={`p-6 ${index !== stats.contributors.length - 1 ? "border-b border-zinc-200 dark:border-zinc-800" : ""}`}
						>
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
								<div>
									<Text className="text-lg font-semibold">
										{contributor.name}
									</Text>
									<Text className="text-sm text-zinc-500">
										{contributor.email}
									</Text>
								</div>
								<div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4 text-zinc-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<Text className="font-medium">
										{contributor.commits.toLocaleString()} commits
									</Text>
									<div className="bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full text-xs font-medium">
										{contributor.percentage.toFixed(1)}%
									</div>
								</div>
							</div>

							<div className="relative pt-1">
								<div className="flex mb-2 items-center justify-between">
									<div className="flex gap-4">
										<div className="flex items-center">
											<div className="w-3 h-3 rounded-full bg-emerald-500 mr-1" />
											<span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
												+{contributor.additions.toLocaleString()}
											</span>
										</div>
										<div className="flex items-center">
											<div className="w-3 h-3 rounded-full bg-red-500 mr-1" />
											<span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
												-{contributor.deletions.toLocaleString()}
											</span>
										</div>
									</div>
									<span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
										{contributor.files.toLocaleString()} files
									</span>
								</div>
								<div className="overflow-hidden h-2 text-xs flex rounded-full bg-zinc-200 dark:bg-zinc-700">
									<div
										style={{ width: `${contributor.percentage}%` }}
										className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
									/>
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
