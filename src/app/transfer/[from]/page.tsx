import BulkTransferRepositoriesFrom from "./page.client";

export default async function BulkTransferRepositoriesFromPage({
	params,
}: {
	readonly params: Promise<{
		readonly from: string;
	}>;
}): Promise<React.ReactNode> {
	const { from } = await params;

	return (
		<main>
			<BulkTransferRepositoriesFrom from={from} />
		</main>
	);
}
