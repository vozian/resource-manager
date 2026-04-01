"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/containers/card";
import { Button } from "@/app/components/button";
import { IconArrowLeft } from "@tabler/icons-react";

const wizards = [
  {
    name: "Protein Sample",
    description:
      "Specify DNA codes and target concentrations. Creates DNA Dilution and Protein Expression jobs automatically.",
    href: "/wizards/protein-sample",
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/">
          <IconArrowLeft className="size-4" />
          Home
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Job Wizards</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {wizards.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="flex flex-col gap-1 rounded-md border p-4 transition-colors hover:bg-muted"
            >
              <span className="font-medium">{w.name}</span>
              <span className="text-sm text-muted-foreground">
                {w.description}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
