"use client";

import { ResourceTypeForm } from "@/app/components/forms/ResourceTypeForm";
import { useApi } from "@/app/components/providers/ApiProvider";
import { ResourceTypeI } from "@/lib/core/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
  const { resourceTypeId } = useParams<{ resourceTypeId: string }>();
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: resourceType, isPending } = useQuery({
    queryKey: ["resourceType", resourceTypeId],
    queryFn: () => api.getResourceTypeById(resourceTypeId),
  });

  const { data: allParameterTypes } = useQuery({
    queryKey: ["parameterTypes", "all"],
    queryFn: () => api.getAllParameterTypes(),
  });

  const { mutate: updateResourceType } = useMutation({
    mutationFn: (data: Partial<ResourceTypeI>) => {
      return api.updateResourceType(resourceTypeId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resourceType", resourceTypeId] });
      router.push(`/entities/resource-types/${resourceTypeId}`);
    },
  });

  if (isPending || !allParameterTypes) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  }

  if (!resourceType) {
    return <p className="p-6 text-sm text-destructive">Resource type not found.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href={`/entities/resource-types/${resourceTypeId}`}>
          <IconArrowLeft className="size-4" />
          Back to resource type
        </Link>
      </Button>
      <ResourceTypeForm
        initialData={resourceType}
        allParameterTypes={allParameterTypes}
        onSubmit={(data) => updateResourceType(data)}
      />
    </div>
  );
}
