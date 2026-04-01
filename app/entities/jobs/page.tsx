"use client";

import { useApi } from "@/app/components/providers/ApiProvider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/app/components/containers/card";
import { Button } from "@/app/components/button";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";

export default function Page() {
  const api = useApi();
  const router = useRouter();
  const { data: jobs, isPending } = useQuery({
    queryKey: ["jobs", "all"],
    queryFn: () => api.getAllJobs(),
  });

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/entities">
          <IconArrowLeft className="size-4" />
          All entities
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardAction>
            <Button variant="outline" size="sm" asChild>
              <Link href="/entities/jobs/new">
                <IconPlus className="size-4" />
                New
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isPending && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {jobs && jobs.length === 0 && (
            <p className="text-sm text-muted-foreground">No jobs yet.</p>
          )}
          {jobs && jobs.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mappings</TableHead>
                  <TableHead>Common</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/entities/jobs/${job.id}`)}
                  >
                    <TableCell>
                      <Link
                        href={`/entities/jobs/${job.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {job.name}
                      </Link>
                    </TableCell>
                    <TableCell>{job.mappings.length}</TableCell>
                    <TableCell>{job.common.length}</TableCell>
                    <TableCell>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
