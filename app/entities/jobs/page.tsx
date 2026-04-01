"use client";

import { useState } from "react";
import { useApi } from "@/app/components/providers/ApiProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/dialog";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input-fields/input";
import { Textarea } from "@/app/components/textarea";
import { Label } from "@/app/components/label";
import { Checkbox } from "@/app/components/checkbox";
import {
  IconArrowLeft,
  IconPlus,
  IconArrowMergeAltRight,
} from "@tabler/icons-react";
import { JobI, ResourceQuantityI, ResourceTypeI } from "@/lib/core/types";
import { OmitEntityFields } from "@/app/components/utils/types";
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
    .map(
      (rq) =>
        resourceTypesMap.get(rq.resourceTypeId)?.name ?? rq.resourceTypeId,
    )
    .join(", ");
}

function resourceQuantityKey(rq: ResourceQuantityI): string {
  const params = [...rq.quantityParameters]
    .sort((a, b) => a.parameterTypeId.localeCompare(b.parameterTypeId))
    .map((qp) => `${qp.parameterTypeId}:${qp.value}`)
    .join("|");
  return `${rq.resourceTypeId}::${params}`;
}

function deduplicateCommonResources(
  resources: ResourceQuantityI[],
): ResourceQuantityI[] {
  const seen = new Set<string>();
  return resources.filter((rq) => {
    const key = resourceQuantityKey(rq);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function Page() {
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<JobFilter[]>([]);
  const [onlyAllReady, setOnlyAllReady] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergeName, setMergeName] = useState("");
  const [mergeNotes, setMergeNotes] = useState("");

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

  const { mutate: mergeJobs } = useMutation({
    mutationFn: async () => {
      const selected = (jobs ?? []).filter((j) => selectedJobIds.has(j.id));
      const mergedMappings = selected.flatMap((j) => j.mappings);
      const mergedCommon = deduplicateCommonResources(
        selected.flatMap((j) => j.common),
      );

      const newJob = await api.createJob({
        name: mergeName,
        notes: mergeNotes,
        mappings: mergedMappings,
        common: mergedCommon,
      } as OmitEntityFields<JobI>);

      await Promise.all(selected.map((j) => api.deleteJob(j.id)));

      return newJob;
    },
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setSelectedJobIds(new Set());
      setMergeDialogOpen(false);
      router.push(`/entities/jobs/${newJob.id}`);
    },
  });

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const resourceTypesMap = new Map(
    (allResourceTypes ?? []).map((rt) => [rt.id, rt]),
  );

  const filteredJobs = jobs
    ? applyFilters(jobs, filters, allParameterTypes ?? []).filter((job) => {
        if (!onlyAllReady) return true;
        const allInputs = job.mappings.flatMap((m) => m.inputs);
        return (
          allInputs.length > 0 && allInputs.every((i) => i.status === "ready")
        );
      })
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
          <CardAction className="flex gap-2">
            {selectedJobIds.size >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMergeName("");
                  setMergeNotes("");
                  setMergeDialogOpen(true);
                }}
              >
                <IconArrowMergeAltRight className="size-4" />
                Merge {selectedJobIds.size} jobs
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/entities/jobs/new">
                <IconPlus className="size-4" />
                New
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="all-ready-filter"
              checked={onlyAllReady}
              onCheckedChange={(checked) => setOnlyAllReady(checked === true)}
            />
            <Label
              htmlFor="all-ready-filter"
              className="cursor-pointer text-sm"
            >
              Ready jobs only
            </Label>
          </div>

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
                  <TableHead className="w-10" />
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedJobIds.has(job.id)}
                          onCheckedChange={() => toggleJobSelection(job.id)}
                        />
                      </TableCell>
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

      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge {selectedJobIds.size} Jobs</DialogTitle>
            <DialogDescription>
              All mappings will be combined. Duplicate common resources will be
              deduplicated. The original jobs will be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="merge-name">Name</Label>
              <Input
                id="merge-name"
                placeholder="Merged job name"
                value={mergeName}
                onChange={(e) => setMergeName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="merge-notes">Notes</Label>
              <Textarea
                id="merge-notes"
                placeholder="Optional notes..."
                value={mergeNotes}
                onChange={(e) => setMergeNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!mergeName.trim()} onClick={() => mergeJobs()}>
              Merge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
