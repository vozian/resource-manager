"use client";

import { JobForm } from "@/app/components/forms/JobForm";
import { useApi } from "@/app/components/providers/ApiProvider";
import { OmitEntityFields } from "@/app/components/utils/types";
import { JobI } from "@/lib/core/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
  const api = useApi();
  const router = useRouter();

  const { data: allParameterTypes } = useQuery({
    queryKey: ["parameterTypes", "all"],
    queryFn: () => api.getAllParameterTypes(),
  });

  const { data: allResourceTypes } = useQuery({
    queryKey: ["resourceTypes", "all"],
    queryFn: () => api.getAllResourceTypes(),
  });

  const { mutate: createNewJob } = useMutation({
    mutationFn: (data: OmitEntityFields<JobI>) => {
      return api.createJob(data);
    },
    onSuccess: (data) => {
      router.push(`/entities/jobs/${data.id}`);
    },
  });

  if (!allParameterTypes || !allResourceTypes) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/entities/jobs">
          <IconArrowLeft className="size-4" />
          Back to list
        </Link>
      </Button>
      <JobForm
        initialData={{}}
        allParameterTypes={allParameterTypes}
        allResourceTypes={allResourceTypes}
        onSubmit={(data) => createNewJob(data as OmitEntityFields<JobI>)}
      />
    </div>
  );
}
