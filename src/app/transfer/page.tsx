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
import { transferRepositories } from "@/actions/repositories/transfer";
import { useEffect, useState } from "react";
import PageHeading from "@/components/PageHeading";
import { Strong, Text, TextLink } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import Image from "next/image";
import RequireSignIn from "@/components/RequireSignIn";
import { toast } from "sonner";
import { useAuth } from "../providers";
import { Checkbox } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";

export default function BulkTransferRepositories() {
	const { token } = useAuth();
	const [fromOrg, setFromOrg] = useQueryState("from");
	const [toOrg, setToOrg] = useQueryState("to");

	const isSignedIn = token && token.length > 0;

	const resetFlow = () => {
		setFromOrg(null);
		setToOrg(null);
	};

	return (
		<div className="flex flex-col justify-center h-full">
			<PageHeading
				title="Bulk Transfer Repositories"
				description="Move your repositories in bulk between organizations and personal accounts."
			/>
			
			{!fromOrg && (
				<>
					<Text>
						Select the organization you want to transfer repositories{" "}
						<Strong>from</Strong>.
					</Text>
					<Divider className="my-6" />
					{isSignedIn ? <OrganizationsListFrom /> : <RequireSignIn />}
				</>
			)}
			
			{fromOrg && !toOrg && (
				<>
					<Text>
						Select the organization you want to transfer repositories{" "}
						<Strong>to</Strong>.
					</Text>
					<Button 
						outline
						className="mt-2 self-start"
						onClick={resetFlow}
					>
						Back to start
					</Button>
					<Divider className="my-6" />
					{isSignedIn ? <OrganizationsListTo fromOrg={fromOrg} /> : <RequireSignIn />}
				</>
			)}
			
			{fromOrg && toOrg && (
				<>
					<Text>
						Now select which repositories you want to transfer from{" "}
						<Strong>{fromOrg}</Strong> to <Strong>{toOrg}</Strong>.
					</Text>
					<Button 
						outline
						className="mt-2 self-start"
						onClick={() => setToOrg(null)}
					>
						Back to organization selection
					</Button>
					<Divider className="my-6" />
					{isSignedIn ? (
						<MoveRepositories from={fromOrg} to={toOrg} resetFlow={resetFlow} />
					) : (
						<RequireSignIn />
					)}
				</>
			)}
		</div>
	);
}

function OrganizationsListFrom() {
	const { token } = useAuth();
	const [orgs, setOrgs] = useState<any[] | null>(null);
	const [_, setFromOrg] = useQueryState("from");

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
							onClick={() => setFromOrg(org.handle)}
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

function OrganizationsListTo({ fromOrg }: { readonly fromOrg: string }) {
	const { token } = useAuth();
	const [orgs, setOrgs] = useState<any[] | null>(null);
	const [_, setToOrg] = useQueryState("to");

	useEffect(() => {
		async function getListOfOrganizations() {
			const response = await listOrganisations({
				exclude: fromOrg,
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
	}, [token, fromOrg]);

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
							onClick={() => setToOrg(org.handle)}
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

function MoveRepositories({
	from,
	to,
	resetFlow,
}: {
	readonly from: string;
	readonly to: string;
	resetFlow: () => void;
}): React.ReactNode {
	const { token } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [repositories, setRepositories] = useState<any[] | null>(null);
	const [selectedRepos, setSelectedRepos] = useState<string[]>([]);

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
					resetFlow={resetFlow}
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
	resetFlow,
}: {
	readonly from: string;
	readonly to: string;
	readonly selectedRepos: string[];
	refresh?: () => void;
	resetFlow: () => void;
}): React.ReactNode {
	const { token } = useAuth();
	const [isTransferring, setIsTransferring] = useState(false);

	const handleTransfer = async () => {
		setIsTransferring(true);
		const { is_error, error, token_expired } = await transferRepositories({
			token: token ?? "",
			from,
			to,
			repositories: selectedRepos,
		});

		setIsTransferring(false);

		if (token_expired) {
			toast.error("Session expired. Please sign in again.");
			return;
		}

		if (is_error) {
			console.error(error);
			toast.error(error ?? "Failed to transfer repositories. Please try again.");
			return;
		}

		toast.success("Repositories transferred successfully!");
		refresh();
		// Optional: Reset the flow after successful transfer
		// resetFlow();
	};

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
					onClick={handleTransfer}
					disabled={isTransferring}
				>
					{isTransferring ? "Transferring..." : `Transfer ${selectedRepos.length} Repositories`}
				</Button>
			</div>
		</div>
	);
}
