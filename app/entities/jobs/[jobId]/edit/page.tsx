"use client";

import { JobForm } from "@/app/components/forms/JobForm";
import { useApi } from "@/app/components/providers/ApiProvider";
import { JobI } from "@/lib/core/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
  const { jobId } = useParams<{ jobId: string }>();
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: job, isPending: jobPending } = useQuery({
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

  const { mutate: updateJob } = useMutation({
    mutationFn: (data: Partial<JobI>) => {
      return api.updateJob(jobId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      router.push(`/entities/jobs/${jobId}`);
    },
  });

  if (jobPending || !allParameterTypes || !allResourceTypes) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  }

  if (!job) {
    return <p className="p-6 text-sm text-destructive">Job not found.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href={`/entities/jobs/${jobId}`}>
          <IconArrowLeft className="size-4" />
          Back to job
        </Link>
      </Button>
      <JobForm
        initialData={job}
        allParameterTypes={allParameterTypes}
        allResourceTypes={allResourceTypes}
        onSubmit={(data) => updateJob(data)}
      />
    </div>
  );
}
