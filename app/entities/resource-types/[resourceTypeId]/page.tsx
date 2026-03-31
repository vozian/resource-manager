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
import { Button } from "@/app/components/button";
import {
  IconArrowLeft,
  IconCopy,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
  const { resourceTypeId } = useParams<{ resourceTypeId: string }>();
  const api = useApi();
  const router = useRouter();

  const { data: resourceType, isPending } = useQuery({
    queryKey: ["resourceType", resourceTypeId],
    queryFn: () => api.getResourceTypeById(resourceTypeId),
  });

  const { data: allParameterTypes } = useQuery({
    queryKey: ["parameterTypes", "all"],
    queryFn: () => api.getAllParameterTypes(),
  });

  const { mutate: duplicateResourceType } = useMutation({
    mutationFn: () => api.duplicateResourceType(resourceTypeId),
    onSuccess: (data) => {
      if (data) router.push(`/entities/resource-types/${data.id}`);
    },
  });

  const { mutate: deleteResourceType } = useMutation({
    mutationFn: () => api.deleteResourceType(resourceTypeId),
    onSuccess: () => {
      router.push("/entities/resource-types");
    },
  });

  if (isPending) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  }

  if (!resourceType) {
    return (
      <p className="p-6 text-sm text-destructive">Resource type not found.</p>
    );
  }

  const parameterTypesMap = new Map(
    (allParameterTypes ?? []).map((pt) => [pt.id, pt]),
  );

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/entities/resource-types">
          <IconArrowLeft className="size-4" />
          Back to list
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Name: {resourceType.name}</CardTitle>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/entities/resource-types/${resourceTypeId}/edit`}>
                <IconEdit className="size-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateResourceType()}
            >
              <IconCopy className="size-4" />
              Duplicate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteResourceType()}
            >
              <IconTrash className="size-4" />
              Delete
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">ID</Label>
            <p className="text-sm font-mono">{resourceType.id}</p>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">
              Constraint Parameters
            </Label>
            {resourceType.constraintParameters.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : (
              <ul className="text-sm space-y-1">
                {resourceType.constraintParameters.map((cp) => {
                  const pt = parameterTypesMap.get(cp.parameterTypeId);
                  return (
                    <li key={cp.parameterTypeId}>
                      <span className="font-medium">
                        {pt?.name ?? cp.parameterTypeId}
                      </span>
                      : {String(cp.value)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">
              Quantity Parameter Types
            </Label>
            {resourceType.quantityParameterTypeIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : (
              <ul className="text-sm space-y-1">
                {resourceType.quantityParameterTypeIds.map((id) => {
                  const pt = parameterTypesMap.get(id);
                  return <li key={id}>{pt?.name ?? id}</li>;
                })}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Created</Label>
            <p className="text-sm">
              {new Date(resourceType.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Updated</Label>
            <p className="text-sm">
              {new Date(resourceType.updatedAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
