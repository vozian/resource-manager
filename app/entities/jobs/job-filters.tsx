"use client";

import { Button } from "@/app/components/button";
import { Label } from "@/app/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import { Input } from "@/app/components/input-fields/input";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  JobI,
  ParameterTypeSetI,
  ParameterValueTypeI,
  ResourceQuantityI,
  ResourceTypeI,
} from "@/lib/core/types";

type FilterScope = "common" | "input" | "output";
type Operator = "=" | ">" | "<" | ">=" | "<=";

type ParamCondition = {
  parameterTypeId: string;
  operator: Operator;
  value: string;
};

export type JobFilter = {
  id: string;
  scope: FilterScope;
  resourceTypeId: string;
  paramConditions: ParamCondition[];
};

let nextFilterId = 0;

function createFilter(): JobFilter {
  return {
    id: String(nextFilterId++),
    scope: "common",
    resourceTypeId: "",
    paramConditions: [],
  };
}

function matchesParamCondition(
  rq: ResourceQuantityI,
  condition: ParamCondition,
  allParameterTypes: ParameterTypeSetI,
): boolean {
  const param = rq.quantityParameters.find(
    (qp) => qp.parameterTypeId === condition.parameterTypeId,
  );
  if (!param) return false;

  const pt = allParameterTypes.find(
    (p) => p.id === condition.parameterTypeId,
  );

  if (pt?.valueType === ParameterValueTypeI.NUMBER) {
    const actual = Number(param.value);
    const target = Number(condition.value);
    if (isNaN(actual) || isNaN(target)) return false;
    switch (condition.operator) {
      case "=":
        return actual === target;
      case ">":
        return actual > target;
      case "<":
        return actual < target;
      case ">=":
        return actual >= target;
      case "<=":
        return actual <= target;
    }
  }

  if (pt?.valueType === ParameterValueTypeI.BOOLEAN) {
    return String(param.value) === condition.value;
  }

  // String: only equality
  return String(param.value) === condition.value;
}

function matchesFilter(
  job: JobI,
  filter: JobFilter,
  allParameterTypes: ParameterTypeSetI,
): boolean {
  if (!filter.resourceTypeId) return true;

  let candidates: ResourceQuantityI[];

  if (filter.scope === "common") {
    candidates = job.common;
  } else if (filter.scope === "input") {
    candidates = job.mappings.flatMap((m) => m.inputs);
  } else {
    candidates = job.mappings.flatMap((m) => m.outputs);
  }

  const typeMatches = candidates.filter(
    (rq) => rq.resourceTypeId === filter.resourceTypeId,
  );
  if (typeMatches.length === 0) return false;

  if (filter.paramConditions.length === 0) return true;

  return typeMatches.some((rq) =>
    filter.paramConditions.every((cond) =>
      matchesParamCondition(rq, cond, allParameterTypes),
    ),
  );
}

export function applyFilters(
  jobs: JobI[],
  filters: JobFilter[],
  allParameterTypes: ParameterTypeSetI,
): JobI[] {
  const activeFilters = filters.filter((f) => f.resourceTypeId);
  if (activeFilters.length === 0) return jobs;
  return jobs.filter((job) =>
    activeFilters.every((f) => matchesFilter(job, f, allParameterTypes)),
  );
}

function FilterRow({
  filter,
  allResourceTypes,
  allParameterTypes,
  onChange,
  onRemove,
}: {
  filter: JobFilter;
  allResourceTypes: ResourceTypeI[];
  allParameterTypes: ParameterTypeSetI;
  onChange: (updated: JobFilter) => void;
  onRemove: () => void;
}) {
  const selectedResourceType = allResourceTypes.find(
    (rt) => rt.id === filter.resourceTypeId,
  );
  const availableParamTypes = selectedResourceType
    ? allParameterTypes.filter((pt) =>
        selectedResourceType.quantityParameterTypeIds.includes(pt.id),
      )
    : [];

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Filter Type</Label>
          <Select
            value={filter.scope}
            onValueChange={(v: FilterScope) =>
              onChange({ ...filter, scope: v })
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="common">Common Params</SelectItem>
              <SelectItem value="input">Input Mapping</SelectItem>
              <SelectItem value="output">Output Mapping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <Label className="text-xs">Resource Type</Label>
          <Select
            value={filter.resourceTypeId}
            onValueChange={(v) =>
              onChange({ ...filter, resourceTypeId: v, paramConditions: [] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select resource type..." />
            </SelectTrigger>
            <SelectContent>
              {allResourceTypes.map((rt) => (
                <SelectItem key={rt.id} value={rt.id}>
                  {rt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <IconTrash className="size-4" />
        </Button>
      </div>

      {filter.resourceTypeId && availableParamTypes.length > 0 && (
        <div className="flex flex-col gap-2 pl-4">
          {filter.paramConditions.map((cond, condIndex) => {
            const pt = allParameterTypes.find(
              (p) => p.id === cond.parameterTypeId,
            );
            const isNumber = pt?.valueType === ParameterValueTypeI.NUMBER;
            const isBoolean = pt?.valueType === ParameterValueTypeI.BOOLEAN;

            return (
              <div key={condIndex} className="flex items-end gap-2">
                <div className="flex flex-col gap-1.5">
                  {condIndex === 0 && (
                    <Label className="text-xs">Parameter</Label>
                  )}
                  <Select
                    value={cond.parameterTypeId}
                    onValueChange={(v) => {
                      const updated = [...filter.paramConditions];
                      updated[condIndex] = {
                        ...cond,
                        parameterTypeId: v,
                        operator: "=",
                        value: "",
                      };
                      onChange({ ...filter, paramConditions: updated });
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableParamTypes.map((pt) => (
                        <SelectItem key={pt.id} value={pt.id}>
                          {pt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isNumber && (
                  <div className="flex flex-col gap-1.5">
                    {condIndex === 0 && (
                      <Label className="text-xs">Operator</Label>
                    )}
                    <Select
                      value={cond.operator}
                      onValueChange={(v: Operator) => {
                        const updated = [...filter.paramConditions];
                        updated[condIndex] = { ...cond, operator: v };
                        onChange({ ...filter, paramConditions: updated });
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value=">">&gt;</SelectItem>
                        <SelectItem value="<">&lt;</SelectItem>
                        <SelectItem value=">=">&gt;=</SelectItem>
                        <SelectItem value="<=">&lt;=</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-1.5">
                  {condIndex === 0 && (
                    <Label className="text-xs">Value</Label>
                  )}
                  {isBoolean ? (
                    <Select
                      value={cond.value}
                      onValueChange={(v) => {
                        const updated = [...filter.paramConditions];
                        updated[condIndex] = { ...cond, value: v };
                        onChange({ ...filter, paramConditions: updated });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={isNumber ? "number" : "text"}
                      placeholder="Value"
                      value={cond.value}
                      onChange={(e) => {
                        const updated = [...filter.paramConditions];
                        updated[condIndex] = {
                          ...cond,
                          value: e.target.value,
                        };
                        onChange({ ...filter, paramConditions: updated });
                      }}
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const updated = filter.paramConditions.filter(
                      (_, i) => i !== condIndex,
                    );
                    onChange({ ...filter, paramConditions: updated });
                  }}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            );
          })}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() =>
              onChange({
                ...filter,
                paramConditions: [
                  ...filter.paramConditions,
                  { parameterTypeId: "", operator: "=", value: "" },
                ],
              })
            }
          >
            <IconPlus className="size-3" />
            Add condition
          </Button>
        </div>
      )}
    </div>
  );
}

export function JobFilters({
  filters,
  onFiltersChange,
  allResourceTypes,
  allParameterTypes,
}: {
  filters: JobFilter[];
  onFiltersChange: (filters: JobFilter[]) => void;
  allResourceTypes: ResourceTypeI[];
  allParameterTypes: ParameterTypeSetI;
}) {
  return (
    <div className="flex flex-col gap-2">
      {filters.map((filter, index) => (
        <FilterRow
          key={filter.id}
          filter={filter}
          allResourceTypes={allResourceTypes}
          allParameterTypes={allParameterTypes}
          onChange={(updated) => {
            const next = [...filters];
            next[index] = updated;
            onFiltersChange(next);
          }}
          onRemove={() => onFiltersChange(filters.filter((_, i) => i !== index))}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onFiltersChange([...filters, createFilter()])}
      >
        <IconPlus className="size-4" />
        Add Filter
      </Button>
    </div>
  );
}
