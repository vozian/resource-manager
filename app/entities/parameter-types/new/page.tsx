"use client";

import { ParameterTypeForm } from "@/app/components/forms/ParameterTypeForm";
import { useApi } from "@/app/components/providers/ApiProvider";
import { OmitEntityFields } from "@/app/components/utils/types";
import { ParameterTypeI } from "@/lib/core/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
  const api = useApi();
  const router = useRouter();

  const { mutate: createNewParameterType } = useMutation({
    mutationFn: (data: OmitEntityFields<ParameterTypeI>) => {
      return api.createParameterType(data);
    },
    onSuccess: (data) => {
      router.push(`/entities/parameter-types/${data.id}`);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/entities/parameter-types">
          <IconArrowLeft className="size-4" />
          Back to list
        </Link>
      </Button>
      <ParameterTypeForm onSubmit={(data) => createNewParameterType(data)} />
    </div>
  );
}
