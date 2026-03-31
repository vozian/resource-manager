"use client";

import { useApi } from "@/app/components/providers/ApiProvider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/app/components/containers/card";
import { Button } from "@/app/components/button";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";

export default function Page() {
  const api = useApi();
  const router = useRouter();
  const { data: resourceTypes, isPending } = useQuery({
    queryKey: ["resourceTypes", "all"],
    queryFn: () => api.getAllResourceTypes(),
  });

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/entities">
          <IconArrowLeft className="size-4" />
          All entities
        </Link>
      </Button>
    <Card>
      <CardHeader>
        <CardTitle>Resource Types</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/entities/resource-types/new">
              <IconPlus className="size-4" />
              New
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isPending && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
        {resourceTypes && resourceTypes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No resource types yet.
          </p>
        )}
        {resourceTypes && resourceTypes.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Constraint Parameters</TableHead>
                <TableHead>Quantity Parameter Types</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resourceTypes.map((rt) => (
                <TableRow
                  key={rt.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/entities/resource-types/${rt.id}`)
                  }
                >
                  <TableCell>
                    <Link
                      href={`/entities/resource-types/${rt.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {rt.name}
                    </Link>
                  </TableCell>
                  <TableCell>{rt.constraintParameters.length}</TableCell>
                  <TableCell>{rt.quantityParameterTypeIds.length}</TableCell>
                  <TableCell>
                    {new Date(rt.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
