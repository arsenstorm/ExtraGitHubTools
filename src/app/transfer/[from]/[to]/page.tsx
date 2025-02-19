import BulkTransferRepositoriesFromTo from "./page.client";

export default async function BulkTransferRepositoriesFromToPage({
	params,
}: {
	readonly params: Promise<{
		readonly from: string;
		readonly to: string;
	}>;
}): Promise<React.ReactNode> {
	const { from, to } = await params;

	return (
		<main>
			<BulkTransferRepositoriesFromTo from={from} to={to} />
		</main>
	);
}
