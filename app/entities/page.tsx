"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/containers/card";
import { IconArrowRight } from "@tabler/icons-react";

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
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-medium">Entities</h1>
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
