"use client";

import { useState } from "react";
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
import { JobI, ResourceTypeI } from "@/lib/core/types";
import { JobFilters, JobFilter, applyFilters } from "./job-filters";

function statusBreakdown(job: JobI) {
  const counts: Record<string, number> = {};
  for (const m of job.mappings) {
    for (const input of m.inputs) {
      counts[input.status] = (counts[input.status] ?? 0) + 1;
    }
  }
  return counts;
}

const statusStyles: Record<string, { dot: string; bg: string }> = {
  ready: { dot: "bg-green-500", bg: "bg-green-500/15 text-green-700" },
  unavailable: { dot: "bg-red-500", bg: "bg-red-500/15 text-red-700" },
  canceled: { dot: "bg-gray-400", bg: "bg-gray-500/15 text-gray-600" },
  review: { dot: "bg-amber-500", bg: "bg-amber-500/15 text-amber-700" },
};

function commonResourceNames(
  job: JobI,
  resourceTypesMap: Map<string, ResourceTypeI>,
) {
  return job.common
    .map((rq) => resourceTypesMap.get(rq.resourceTypeId)?.name ?? rq.resourceTypeId)
    .join(", ");
}

export default function Page() {
  const api = useApi();
  const router = useRouter();
  const [filters, setFilters] = useState<JobFilter[]>([]);

  const { data: jobs, isPending } = useQuery({
    queryKey: ["jobs", "all"],
    queryFn: () => api.getAllJobs(),
  });

  const { data: allResourceTypes } = useQuery({
    queryKey: ["resourceTypes", "all"],
    queryFn: () => api.getAllResourceTypes(),
  });

  const { data: allParameterTypes } = useQuery({
    queryKey: ["parameterTypes", "all"],
    queryFn: () => api.getAllParameterTypes(),
  });

  const resourceTypesMap = new Map(
    (allResourceTypes ?? []).map((rt) => [rt.id, rt]),
  );

  const filteredJobs = jobs
    ? applyFilters(jobs, filters, allParameterTypes ?? [])
    : undefined;

  const sortedJobs = filteredJobs
    ? [...filteredJobs].sort((a, b) => b.mappings.length - a.mappings.length)
    : undefined;

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
        <CardContent className="flex flex-col gap-4">
          {allResourceTypes && allParameterTypes && (
            <JobFilters
              filters={filters}
              onFiltersChange={setFilters}
              allResourceTypes={allResourceTypes}
              allParameterTypes={allParameterTypes}
            />
          )}

          {isPending && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {sortedJobs && sortedJobs.length === 0 && (
            <p className="text-sm text-muted-foreground">No jobs yet.</p>
          )}
          {sortedJobs && sortedJobs.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Common Resources</TableHead>
                  <TableHead>Mappings</TableHead>
                  <TableHead>Input Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobs.map((job) => {
                  const breakdown = statusBreakdown(job);
                  const statusEntries = Object.entries(breakdown);
                  return (
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
                      <TableCell className="max-w-48">
                        {job.notes ? (
                          <span className="truncate block text-muted-foreground">
                            {job.notes}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {job.common.length > 0 ? (
                          <span className="text-sm">
                            {commonResourceNames(job, resourceTypesMap)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{job.mappings.length}</TableCell>
                      <TableCell>
                        {statusEntries.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {statusEntries.map(([status, count]) => {
                              const styles = statusStyles[status];
                              return (
                                <span
                                  key={status}
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles?.bg ?? "bg-muted text-muted-foreground"}`}
                                >
                                  <span
                                    className={`size-1.5 rounded-full ${styles?.dot ?? "bg-muted-foreground"}`}
                                  />
                                  {count} {status}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(job.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
