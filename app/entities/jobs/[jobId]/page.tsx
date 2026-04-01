"use client";

import { useApi } from "@/app/components/providers/ApiProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/app/components/containers/card";
import { Label } from "@/app/components/label";
import { Separator } from "@/app/components/separator";
import { Button } from "@/app/components/button";
import {
  IconArrowLeft,
  IconCopy,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { ResourceQuantityI } from "@/lib/core/types";

export default function Page() {
  const { jobId } = useParams<{ jobId: string }>();
  const api = useApi();
  const router = useRouter();

  const { data: job, isPending } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => api.getJobById(jobId),
  });

  const { data: allParameterTypes } = useQuery({
    queryKey: ["parameterTypes", "all"],
    queryFn: () => api.getAllParameterTypes(),
  });

  const { data: allResourceTypes } = useQuery({
    queryKey: ["resourceTypes", "all"],
    queryFn: () => api.getAllResourceTypes(),
  });

  const { mutate: duplicateJob } = useMutation({
    mutationFn: () => api.duplicateJob(jobId),
    onSuccess: (data) => {
      if (data) router.push(`/entities/jobs/${data.id}`);
    },
  });

  const { mutate: deleteJob } = useMutation({
    mutationFn: () => api.deleteJob(jobId),
    onSuccess: () => {
      router.push("/entities/jobs");
    },
  });

  if (isPending) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  }

  if (!job) {
    return <p className="p-6 text-sm text-destructive">Job not found.</p>;
  }

  const parameterTypesMap = new Map(
    (allParameterTypes ?? []).map((pt) => [pt.id, pt]),
  );
  const resourceTypesMap = new Map(
    (allResourceTypes ?? []).map((rt) => [rt.id, rt]),
  );

  function renderResourceQuantity(rq: ResourceQuantityI) {
    const rt = resourceTypesMap.get(rq.resourceTypeId);
    const expectedParamTypeIds = rt?.quantityParameterTypeIds ?? [];
    return (
      <div className="rounded-md border p-2 text-sm space-y-1">
        <p className="font-medium">{rt?.name ?? rq.resourceTypeId}</p>
        {expectedParamTypeIds.length > 0 && (
          <ul className="ml-4 space-y-0.5">
            {expectedParamTypeIds.map((ptId, paramIndex) => {
              const pt = parameterTypesMap.get(ptId);
              const value = rq.quantityParameters[paramIndex]?.value;
              return (
                <li key={ptId}>
                  {pt?.name ?? ptId}:{" "}
                  {value !== undefined ? (
                    String(value)
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/entities/jobs">
          <IconArrowLeft className="size-4" />
          Back to list
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Name: {job.name}</CardTitle>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/entities/jobs/${jobId}/edit`}>
                <IconEdit className="size-4" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => duplicateJob()}>
              <IconCopy className="size-4" />
              Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={() => deleteJob()}>
              <IconTrash className="size-4" />
              Delete
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">ID</Label>
            <p className="text-sm font-mono">{job.id}</p>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Resource Flow</Label>
            {job.mappings.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : (
              job.mappings.map((m, i) => (
                <div
                  key={i}
                  className="rounded-md border p-3 text-sm space-y-2"
                >
                  <Label className="text-xs text-muted-foreground">
                    Item {i + 1}
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Inputs</Label>
                      {m.inputs.map((rq, j) => (
                        <div key={j}>{renderResourceQuantity(rq)}</div>
                      ))}
                      {m.inputs.length === 0 && (
                        <p className="text-xs text-muted-foreground">None</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Outputs</Label>
                      {m.outputs.map((rq, j) => (
                        <div key={j}>{renderResourceQuantity(rq)}</div>
                      ))}
                      {m.outputs.length === 0 && (
                        <p className="text-xs text-muted-foreground">None</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Common Resources</Label>
            {job.common.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : (
              job.common.map((rq, i) => (
                <div key={i}>{renderResourceQuantity(rq)}</div>
              ))
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Created</Label>
            <p className="text-sm">
              {new Date(job.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Updated</Label>
            <p className="text-sm">
              {new Date(job.updatedAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
