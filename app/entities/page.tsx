"use client";

import Link from "next/link";
import { useApi } from "@/app/components/providers/ApiProvider";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/containers/card";
import { Button } from "@/app/components/button";
import { IconArrowRight, IconRefresh } from "@tabler/icons-react";

const entityTypes = [
  {
    name: "Parameter Types",
    description: "Define parameter types with value constraints (string, number, boolean).",
    href: "/entities/parameter-types",
  },
  {
    name: "Resource Types",
    description: "Define resource types with constraint parameters and quantity parameter types.",
    href: "/entities/resource-types",
  },
  {
    name: "Jobs",
    description: "Define jobs with input and output resource requirements.",
    href: "/entities/jobs",
  },
];

export default function Page() {
  const api = useApi();
  const queryClient = useQueryClient();

  const handleReset = async () => {
    await api.resetToMockData();
    queryClient.invalidateQueries();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Entities</h1>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <IconRefresh className="size-4" />
          Reset to mock data
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {entityTypes.map((entity) => (
          <Link key={entity.href} href={entity.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{entity.name}</CardTitle>
                  <IconArrowRight className="size-4 text-muted-foreground" />
                </div>
                <CardDescription>{entity.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        <Link href="/wizards">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Job Wizards</CardTitle>
                <IconArrowRight className="size-4 text-muted-foreground" />
              </div>
              <CardDescription>
                Create jobs from templates with guided forms.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
