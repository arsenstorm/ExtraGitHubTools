"use client";

import { Avatar } from '@/components/ui/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownDivider,
} from '@/components/ui/dropdown'
import { StackedLayout } from '@/components/ui/stacked-layout'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/ui/navbar'
import { Sidebar, SidebarBody, SidebarItem, SidebarSection } from '@/components/ui/sidebar'
import {
  ArrowRightStartOnRectangleIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid'
import { createClient } from '@/utils/client';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', url: '/' },
  { label: 'Bulk Transfer Repositories', url: '/transfer' },
]

function GitHubProfile({
  session,
}: {
  readonly session: Session | null
}) {
  if (!session) {
    return null;
  }

  return (
    <>
      <DropdownItem href={`https://github.com/${session?.user?.user_metadata?.user_name}`}>
        <UserIcon />
        <DropdownLabel>My GitHub Profile</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="https://github.com/settings/installations">
        <Cog8ToothIcon />
        <DropdownLabel>GitHub Installation Settings</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
    </>
  )
}

function SignOutButton({
  session
}: {
  readonly session?: Session | null
}) {
  const supabase = createClient();

  if (!session) {
    return null;
  }
  
  return (
    <>
      <DropdownDivider />
      <DropdownItem
        onClick={async () => {
          const { error } = await supabase.auth.signOut();

          if (error) {
            console.error(error);
            toast.error("Failed to sign out. Please try again.");
          }
        }}
      >
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </>
  )
};

export function Navigation({
  children,
}: {
  readonly children: React.ReactNode
}): JSX.Element {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function fetchSession() {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
    }

    fetchSession();
  }, []);

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
                  src={session?.user?.user_metadata?.avatar_url}
                  initials={session?.user?.user_metadata?.avatar_url ? undefined : "?"}
                  square
                />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                <GitHubProfile session={session} />
                <DropdownItem href="/privacy">
                  <ShieldCheckIcon />
                  <DropdownLabel>Privacy policy</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/feedback">
                  <LightBulbIcon />
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
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
  )
}