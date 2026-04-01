"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/app/components/input-fields/input";
import { Label } from "@/app/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import {
  IconArrowLeft,
  IconFilter,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { ParameterValueTypeI, ResourceTypeI } from "@/lib/core/types";

type Operator = "equals" | "contains" | "gt" | "lt";

type FilterCondition = {
  parameterTypeId: string;
  operator: Operator;
  value: string;
};

const operatorLabels: Record<Operator, string> = {
  equals: "=",
  contains: "contains",
  gt: ">",
  lt: "<",
};

function getOperatorsForType(valueType: ParameterValueTypeI | undefined): Operator[] {
  if (valueType === ParameterValueTypeI.NUMBER) {
    return ["equals", "gt", "lt"];
  }
  if (valueType === ParameterValueTypeI.BOOLEAN) {
    return ["equals"];
  }
  return ["equals", "contains"];
}

function matchesCondition(
  rt: ResourceTypeI,
  condition: FilterCondition,
  paramValueType: ParameterValueTypeI | undefined,
): boolean {
  const param = rt.constraintParameters.find(
    (cp) => cp.parameterTypeId === condition.parameterTypeId,
  );
  if (!param) return false;

  const actual = String(param.value);
  const expected = condition.value;

  switch (condition.operator) {
    case "equals":
      return actual.toLowerCase() === expected.toLowerCase();
    case "contains":
      return actual.toLowerCase().includes(expected.toLowerCase());
    case "gt":
      return paramValueType === ParameterValueTypeI.NUMBER &&
        Number(actual) > Number(expected);
    case "lt":
      return paramValueType === ParameterValueTypeI.NUMBER &&
        Number(actual) < Number(expected);
    default:
      return false;
  }
}

export default function Page() {
  const api = useApi();
  const router = useRouter();

  const { data: resourceTypes, isPending } = useQuery({
    queryKey: ["resourceTypes", "all"],
    queryFn: () => api.getAllResourceTypes(),
  });

  const { data: allParameterTypes } = useQuery({
    queryKey: ["parameterTypes", "all"],
    queryFn: () => api.getAllParameterTypes(),
  });

  const [nameSearch, setNameSearch] = useState("");
  const [filters, setFilters] = useState<FilterCondition[]>([]);

  const parameterTypesMap = useMemo(
    () => new Map((allParameterTypes ?? []).map((pt) => [pt.id, pt])),
    [allParameterTypes],
  );

  const filteredResourceTypes = useMemo(() => {
    if (!resourceTypes) return [];
    return resourceTypes.filter((rt) => {
      if (nameSearch && !rt.name.toLowerCase().includes(nameSearch.toLowerCase())) {
        return false;
      }
      return filters.every((condition) => {
        if (!condition.parameterTypeId || !condition.value) return true;
        const pt = parameterTypesMap.get(condition.parameterTypeId);
        return matchesCondition(rt, condition, pt?.valueType);
      });
    });
  }, [resourceTypes, nameSearch, filters, parameterTypesMap]);

  function addFilter() {
    setFilters((prev) => [
      ...prev,
      { parameterTypeId: "", operator: "equals", value: "" },
    ]);
  }

  function updateFilter(index: number, updates: Partial<FilterCondition>) {
    setFilters((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f)),
    );
  }

  function removeFilter(index: number) {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  }

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
        <CardContent className="flex flex-col gap-4">
          {/* Search & Filters */}
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Search by name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />

            {filters.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Filters</Label>
                {filters.map((filter, index) => {
                  const selectedPt = parameterTypesMap.get(filter.parameterTypeId);
                  const operators = getOperatorsForType(selectedPt?.valueType);

                  return (
                    <div key={index} className="flex items-end gap-2">
                      <div className="flex flex-1 flex-col gap-1">
                        {index === 0 && <Label className="text-xs">Parameter</Label>}
                        <Select
                          value={filter.parameterTypeId}
                          onValueChange={(v) =>
                            updateFilter(index, {
                              parameterTypeId: v,
                              operator: "equals",
                              value: "",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(allParameterTypes ?? []).map((pt) => (
                              <SelectItem key={pt.id} value={pt.id}>
                                {pt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex w-28 flex-col gap-1">
                        {index === 0 && <Label className="text-xs">Operator</Label>}
                        <Select
                          value={filter.operator}
                          onValueChange={(v) =>
                            updateFilter(index, { operator: v as Operator })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op} value={op}>
                                {operatorLabels[op]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        {index === 0 && <Label className="text-xs">Value</Label>}
                        {selectedPt?.valueType === ParameterValueTypeI.BOOLEAN ? (
                          <Select
                            value={filter.value}
                            onValueChange={(v) =>
                              updateFilter(index, { value: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={
                              selectedPt?.valueType === ParameterValueTypeI.NUMBER
                                ? "number"
                                : "text"
                            }
                            placeholder="Value"
                            value={filter.value}
                            onChange={(e) =>
                              updateFilter(index, { value: e.target.value })
                            }
                          />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFilter(index)}
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={addFilter}
            >
              <IconFilter className="size-4" />
              Add Filter
            </Button>
          </div>

          {/* Table */}
          {isPending && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {resourceTypes && filteredResourceTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {resourceTypes.length === 0
                ? "No resource types yet."
                : "No resource types match the current filters."}
            </p>
          )}
          {filteredResourceTypes.length > 0 && (
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
                {filteredResourceTypes.map((rt) => (
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
