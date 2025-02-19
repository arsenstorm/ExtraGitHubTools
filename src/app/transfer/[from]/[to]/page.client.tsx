"use client";

import { useEffect, useState } from "react";
import PageHeading from "@/components/PageHeading";
import { Strong, Text, TextLink } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { listRepositories } from "@/actions/repositories/list";
import { Checkbox } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { transferRepositories } from "@/actions/repositories/transfer";
import RequireSignIn from "@/components/RequireSignIn";
import { toast } from "sonner";
import { useAuth } from "@/app/providers";

export default function BulkTransferRepositoriesFromTo({
	from,
	to,
}: {
	readonly from: string;
	readonly to: string;
}): React.ReactNode {
	const { token } = useAuth();

	const isSignedIn = token && token.length > 0;

	return (
		<div className="flex flex-col justify-center h-full">
			<PageHeading
				title="Bulk Transfer Repositories"
				description="Move your repositories in bulk between organizations and personal accounts."
			/>
			<Text>
				Now select which repositories you want to transfer from{" "}
				<Strong>{from}</Strong> to <Strong>{to}</Strong>.
			</Text>
			<Divider className="my-6" />
			{isSignedIn ? (
				<MoveRepositories from={from} to={to} />
			) : (
				<RequireSignIn />
			)}
		</div>
	);
}

function MoveRepositories({
	from,
	to,
}: {
	readonly from: string;
	readonly to: string;
}): React.ReactNode {
	const { token } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [repositories, setRepositories] = useState<any[] | null>(null);
	const [selectedRepos, setSelectedRepos] = useState<any[]>([]);

	async function getListOfRepositories({
		account,
		token,
	}: {
		readonly account: string;
		readonly token: string;
	}) {
		setIsLoading(true);

		const response = await listRepositories({
			account,
			token,
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
			setRepositories(response.data);
		}

		setIsLoading(false);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: no need
	useEffect(() => {
		getListOfRepositories({
			account: from,
			token: token ?? "",
		});
	}, [from, token]);

	function updateSelectedRepos(prev: string[], repoName: string): string[] {
		if (prev.includes(repoName)) {
			return prev.filter((name) => name !== repoName);
		}
		return [...prev, repoName];
	}

	const refresh = () => {
		setSelectedRepos([]);
		getListOfRepositories({
			account: from,
			token: token ?? "",
		});
	};

	return (
		<div className="mb-32">
			<Table>
				<TableHead>
					<TableRow>
						<TableHeader>Select</TableHeader>
						<TableHeader>ID</TableHeader>
						<TableHeader>Name</TableHeader>
						<TableHeader>Full Name</TableHeader>
						<TableHeader>Actions</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{!isLoading && repositories ? (
						repositories?.map((repo) => (
							<TableRow key={repo.id}>
								<TableCell>
									<Checkbox
										checked={selectedRepos.includes(repo.name)}
										onChange={() => {
											setSelectedRepos((prev) =>
												updateSelectedRepos(prev, repo.name),
											);
										}}
										className="group block size-4 rounded border bg-white data-[checked]:bg-zinc-500"
									>
										{/* Checkmark icon */}
										<svg
											className="stroke-white opacity-0 group-data-[checked]:opacity-100"
											viewBox="0 0 14 14"
											fill="none"
										>
											<title>{/* noop */}</title>
											<path
												d="M3 8L6 11L11 3.5"
												strokeWidth={2}
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</Checkbox>
								</TableCell>
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
							<TableCell colSpan={5} className="text-center">
								{isLoading ? "Loading..." : "No repositories found."}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			{selectedRepos.length > 0 && (
				<TransferConfirmation
					from={from}
					to={to}
					selectedRepos={selectedRepos}
					refresh={refresh}
				/>
			)}
		</div>
	);
}

function TransferConfirmation({
	from,
	to,
	selectedRepos,
	refresh = () => {},
}: {
	readonly from: string;
	readonly to: string;
	readonly selectedRepos: string[];
	refresh?: () => void;
}): React.ReactNode {
	const { token } = useAuth();

	return (
		<div className="z-50 backdrop-blur-md bg-zinc-950/5 dark:bg-zinc-50/5 fixed bottom-4 max-w-sm mx-auto left-0 right-0 rounded-lg p-4">
			<div className="flex flex-col justify-center items-center gap-4 text-center">
				<Text>
					Ready to transfer {selectedRepos.length} repositories from{" "}
					<Strong>{from}</Strong> to <Strong>{to}</Strong>?
				</Text>
				<Button
					color="red"
					className="w-full"
					onClick={async () => {
						const { is_error, error, token_expired } =
							await transferRepositories({
								token: token ?? "",
								from,
								to,
								repositories: selectedRepos,
							});

						if (token_expired) {
							toast.error("Session expired. Please sign in again.");
							return;
						}

						if (is_error) {
							console.error(error);
							toast.error(
								error ?? "Failed to transfer repositories. Please try again.",
							);
							return;
						}

						toast.success("Repositories transferred successfully!");
						refresh();
					}}
				>
					Transfer {selectedRepos.length} Repositories
				</Button>
			</div>
		</div>
	);
}
