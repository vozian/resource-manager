"use client";

import { ParameterTypeForm } from "@/app/components/forms/ParameterTypeForm";
import { useApi } from "@/app/components/providers/ApiProvider";
import { ParameterTypeI } from "@/lib/core/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
  const { parameterTypeId } = useParams<{ parameterTypeId: string }>();
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: parameterType, isPending } = useQuery({
    queryKey: ["parameterType", parameterTypeId],
    queryFn: () => api.getParameterTypeById(parameterTypeId),
  });

  const { mutate: updateParameterType } = useMutation({
    mutationFn: (data: Partial<ParameterTypeI>) => {
      return api.updateParameterType(parameterTypeId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameterType", parameterTypeId] });
      router.push(`/entities/parameter-types/${parameterTypeId}`);
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
        <Link href={`/entities/parameter-types/${parameterTypeId}`}>
          <IconArrowLeft className="size-4" />
          Back to parameter type
        </Link>
      </Button>
      <ParameterTypeForm
        initialData={parameterType}
        onSubmit={(data) => updateParameterType(data)}
      />
    </div>
  );
}
