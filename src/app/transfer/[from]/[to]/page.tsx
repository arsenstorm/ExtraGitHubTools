"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/client";
import PageHeading from "@/components/PageHeading";
import { Strong, Text, TextLink } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { listRepositories } from "@/actions/repositories/list";
import { Checkbox } from '@headlessui/react'
import { Button } from "@/components/ui/button";
import { transferRepositories } from "@/actions/repositories/transfer";
import RequireSignIn from "@/components/RequireSignIn";
import { toast } from "sonner";

export default function BulkTransferRepositoriesFromTo({
  params: {
    from,
    to
  }
}: {
  readonly params: {
    readonly from: string;
    readonly to: string;
  };
}): JSX.Element {
  const supabase = createClient();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  useEffect(() => {
    async function checkIfSignedIn() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsSignedIn(true);
      }
    }

    checkIfSignedIn();
  }, []);

  return (
    <div className="flex flex-col justify-center h-full">
      <PageHeading
        title="Bulk Transfer Repositories"
        description="Move your repositories in bulk between organizations and personal accounts."
        showButton={!isSignedIn}
      />
      <Text>
        Now select which repositories you want to transfer from <Strong>{from}</Strong> to <Strong>{to}</Strong>.
      </Text>
      <Divider className='my-6' />
      {isSignedIn ? <MoveRepositories from={from} to={to} /> : <RequireSignIn />}
    </div>
  );
}

function MoveRepositories({
  from,
  to
}: {
  readonly from: string;
  readonly to: string;
}): JSX.Element {
  const supabase = createClient();
  const [repositories, setRepositories] = useState<any[] | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<any[]>([]);

  useEffect(() => {
    async function getListOfRepositories() {
      const response = await listRepositories({ account: from });
      if (response.token_expired === true) {
        await supabase.auth.signOut();
      }

      if (response.is_error === true) {
        console.error(response.error);
        toast.error(response?.error ?? "Failed to fetch repositories. Please try again.");
      } else {
        setRepositories(response.data);
      }
    }

    getListOfRepositories();
  }, []);

  function updateSelectedRepos(prev: string[], repoName: string): string[] {
    if (prev.includes(repoName)) {
      return prev.filter((name) => name !== repoName);
    }
    return [...prev, repoName];
  }

  return (
    <div className="mb-32">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>
              Select
            </TableHeader>
            <TableHeader>
              ID
            </TableHeader>
            <TableHeader>
              Name
            </TableHeader>
            <TableHeader>
              Full Name
            </TableHeader>
            <TableHeader>
              Actions
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {repositories ? repositories?.map((repo) => (
            <TableRow key={repo.id}>
              <TableCell>
                <Checkbox
                  checked={selectedRepos.includes(repo.name)}
                  onChange={() => {
                    setSelectedRepos(prev => updateSelectedRepos(prev, repo.name));
                  }}
                  className="group block size-4 rounded border bg-white data-[checked]:bg-zinc-500"
                >
                  {/* Checkmark icon */}
                  <svg className="stroke-white opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
                    <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Checkbox>
              </TableCell>
              <TableCell className="font-medium">
                {repo.id}
              </TableCell>
              <TableCell>
                <Text>
                  {repo.name}
                </Text>
              </TableCell>
              <TableCell>
                <Text>
                  {repo.full_name}
                </Text>
              </TableCell>
              <TableCell>
                <Text>
                  <TextLink href={repo.html_url} target="_blank">
                    View on GitHub
                  </TextLink>
                </Text>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No repositories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {selectedRepos.length > 0 && <TransferConfirmation from={from} to={to} selectedRepos={selectedRepos} />}
    </div>
  )
}

function TransferConfirmation({
  from,
  to,
  selectedRepos
}: {
  readonly from: string;
  readonly to: string;
  readonly selectedRepos: string[];
}): JSX.Element {
  const supabase = createClient();

  return (
    <div className="z-50 backdrop-blur-md bg-zinc-950/5 dark:bg-zinc-50/5 fixed bottom-4 max-w-sm mx-auto left-0 right-0 rounded-lg p-4">
      <div className="flex flex-col justify-center items-center gap-4 text-center">
        <Text>
          Ready to transfer {selectedRepos.length} repositories from <Strong>{from}</Strong> to <Strong>{to}</Strong>?
        </Text>
        <Button
          color="red"
          className="w-full"
          onClick={async () => {
            const { is_error, error, token_expired } = await transferRepositories({ from, to, repositories: selectedRepos });

            if (token_expired) {
              await supabase.auth.signOut();
            }

            if (is_error) {
              console.error(error);
              toast.error(error ?? "Failed to transfer repositories. Please try again.");
            }
          }}
        >
          Transfer {selectedRepos.length} Repositories
        </Button>
      </div>
    </div>
  );
}