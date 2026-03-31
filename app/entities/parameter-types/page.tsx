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
  const { data: parameterTypes, isPending } = useQuery({
    queryKey: ["parameterTypes", "all"],
    queryFn: () => api.getAllParameterTypes(),
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
        <CardTitle>Parameter Types</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/entities/parameter-types/new">
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
        {parameterTypes && parameterTypes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No parameter types yet.
          </p>
        )}
        {parameterTypes && parameterTypes.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Value Type</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameterTypes.map((pt) => (
                <TableRow
                  key={pt.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/entities/parameter-types/${pt.id}`)
                  }
                >
                  <TableCell>
                    <Link
                      href={`/entities/parameter-types/${pt.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {pt.name}
                    </Link>
                  </TableCell>
                  <TableCell className="capitalize">{pt.valueType}</TableCell>
                  <TableCell>
                    {new Date(pt.createdAt).toLocaleDateString()}
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
