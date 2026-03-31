"use client";

import { ResourceTypeForm } from "@/app/components/forms/ResourceTypeForm";
import { useApi } from "@/app/components/providers/ApiProvider";
import { OmitEntityFields } from "@/app/components/utils/types";
import { ResourceTypeI } from "@/lib/core/types";
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

  const { mutate: createNewResourceType } = useMutation({
    mutationFn: (data: OmitEntityFields<ResourceTypeI>) => {
      console.log("Creating resource type with data:", data);
      return api.createResourceType(data);
    },
    onSuccess: (data) => {
      router.push(`/entities/resource-types/${data.id}`);
    },
    onError: (error) => {
      console.error("Failed to duplicate resource type:", error);
    },
  });

  if (!allParameterTypes) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/entities/resource-types">
          <IconArrowLeft className="size-4" />
          Back to list
        </Link>
      </Button>
      <ResourceTypeForm
        initialData={{}}
        allParameterTypes={allParameterTypes}
        onSubmit={(data) =>
          createNewResourceType(data as OmitEntityFields<ResourceTypeI>)
        }
      />
    </div>
  );
}
