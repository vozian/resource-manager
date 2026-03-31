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
import { IconArrowLeft, IconCopy, IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
  const { parameterTypeId } = useParams<{ parameterTypeId: string }>();
  const api = useApi();
  const router = useRouter();

  const { data: parameterType, isPending } = useQuery({
    queryKey: ["parameterType", parameterTypeId],
    queryFn: () => api.getParameterTypeById(parameterTypeId),
  });

  const { mutate: duplicateParameterType } = useMutation({
    mutationFn: () => api.duplicateParameterType(parameterTypeId),
    onSuccess: (data) => {
      if (data) router.push(`/entities/parameter-types/${data.id}`);
    },
  });

  const { mutate: deleteParameterType } = useMutation({
    mutationFn: () => api.deleteParameterType(parameterTypeId),
    onSuccess: () => {
      router.push("/entities/parameter-types");
    },
  });

  if (isPending) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  }

  if (!parameterType) {
    return (
      <p className="p-6 text-sm text-destructive">Parameter type not found.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/entities/parameter-types">
          <IconArrowLeft className="size-4" />
          Back to list
        </Link>
      </Button>
    <Card>
      <CardHeader>
        <CardTitle>Name: {parameterType.name}</CardTitle>
        <CardAction className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/entities/parameter-types/${parameterTypeId}/edit`}>
              <IconEdit className="size-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateParameterType()}
          >
            <IconCopy className="size-4" />
            Duplicate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteParameterType()}
          >
            <IconTrash className="size-4" />
            Delete
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-muted-foreground">Value Type</Label>
          <p className="text-sm capitalize">{parameterType.valueType}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-muted-foreground">ID</Label>
          <p className="text-sm font-mono">{parameterType.id}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-muted-foreground">Created</Label>
          <p className="text-sm">
            {new Date(parameterType.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-muted-foreground">Updated</Label>
          <p className="text-sm">
            {new Date(parameterType.updatedAt).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
