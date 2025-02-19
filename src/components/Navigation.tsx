"use client";

// UI
import { Avatar } from "@/components/ui/avatar";
import {
	Dropdown,
	DropdownButton,
	DropdownItem,
	DropdownLabel,
	DropdownMenu,
	DropdownDivider,
} from "@/components/ui/dropdown";
import { StackedLayout } from "@/components/ui/stacked-layout";
import {
	Navbar,
	NavbarItem,
	NavbarSection,
	NavbarSpacer,
} from "@/components/ui/navbar";
import {
	Sidebar,
	SidebarBody,
	SidebarItem,
	SidebarSection,
} from "@/components/ui/sidebar";
import {
	ArrowRightStartOnRectangleIcon,
	Cog8ToothIcon,
	EnvelopeIcon,
	ShieldCheckIcon,
	TrashIcon,
	UserIcon,
} from "@heroicons/react/16/solid";
import { toast } from "sonner";

// Auth
import { authClient } from "@/auth.client";
import type { Session } from "better-auth";

const navItems = [
	{ label: "Dashboard", url: "/" },
	{ label: "Bulk Transfer Repositories", url: "/transfer" },
];

function GitHubProfile({
	session,
}: {
	readonly session?: Session | null;
}) {
	if (!session) {
		return null;
	}

	return (
		<>
			<DropdownItem href={`https://github.com/${session?.userId}`}>
				<UserIcon />
				<DropdownLabel>My GitHub Profile</DropdownLabel>
			</DropdownItem>
			<DropdownItem href="https://github.com/settings/installations">
				<Cog8ToothIcon />
				<DropdownLabel>GitHub Installation Settings</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
		</>
	);
}

function DeleteMyAccountButton() {
	return (
		<DropdownItem
			onClick={async () => {
				const { error } = await authClient.deleteUser();

				if (error) {
					console.error(error);
					toast.error("Failed to delete your account. Please try again.");
				}
			}}
		>
			<TrashIcon />
			<DropdownLabel>Delete my Account</DropdownLabel>
		</DropdownItem>
	);
}

function SignOutButton() {
	return (
		<DropdownItem
			onClick={async () => {
				const { error } = await authClient.signOut();

				if (error) {
					console.error(error);
					toast.error("Failed to sign out. Please try again.");
				}
			}}
		>
			<ArrowRightStartOnRectangleIcon />
			<DropdownLabel>Sign out</DropdownLabel>
		</DropdownItem>
	);
}

export function Navigation({
	children,
}: {
	readonly children: React.ReactNode;
}): React.ReactNode {
	const { data } = authClient.useSession();

	const session = data?.session;
	const user = data?.user;

	return (
		<StackedLayout
			navbar={
				<Navbar>
					<NavbarSection className="max-lg:hidden">
						{navItems.map(({ label, url }) => (
							<NavbarItem key={label} href={url}>
								{label}
							</NavbarItem>
						))}
					</NavbarSection>
					<NavbarSpacer />
					<NavbarSection>
						<Dropdown>
							<DropdownButton as={NavbarItem}>
								<Avatar
									src={user?.image}
									initials={user?.image ? undefined : "?"}
									square
								/>
							</DropdownButton>
							<DropdownMenu className="min-w-64">
								<GitHubProfile session={session} />
								<DropdownItem href="/privacy">
									<ShieldCheckIcon />
									<DropdownLabel>Privacy policy</DropdownLabel>
								</DropdownItem>
								<DropdownItem href="/contact">
									<EnvelopeIcon />
									<DropdownLabel>Contact</DropdownLabel>
								</DropdownItem>
								<DropdownDivider />
								<DeleteMyAccountButton />
								<SignOutButton />
							</DropdownMenu>
						</Dropdown>
					</NavbarSection>
				</Navbar>
			}
			sidebar={
				<Sidebar>
					<SidebarBody>
						<SidebarSection>
							{navItems.map(({ label, url }) => (
								<SidebarItem key={label} href={url}>
									{label}
								</SidebarItem>
							))}
						</SidebarSection>
					</SidebarBody>
				</Sidebar>
			}
		>
			{children}
		</StackedLayout>
	);
}
