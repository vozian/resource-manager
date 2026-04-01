/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  JobI,
  ParameterTypeSetI,
  ParameterValueTypeI,
  ResourceTypeI,
} from "@/lib/core/types";
import { Input } from "@/app/components/input-fields/input";
import { Button } from "@/app/components/button";
import { Label } from "@/app/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/app/components/containers/card";
import { Separator } from "@/app/components/separator";
import { IconPlus, IconTrash } from "@tabler/icons-react";

type ResourceQuantityFormValues = {
  resourceTypeId: string;
  quantityParameters: { parameterTypeId: string; value: string }[];
  status?: "ready" | "unavailable" | "canceled" | "review";
};

type MappingFormValues = {
  inputs: ResourceQuantityFormValues[];
  outputs: ResourceQuantityFormValues[];
};

type FormValues = {
  name: string;
  mappings: MappingFormValues[];
  common: ResourceQuantityFormValues[];
};

function QuantityParameterValueInput({
  parameterTypeId,
  allParameterTypes,
  control,
  baseName,
  index,
  register,
}: {
  parameterTypeId: string;
  allParameterTypes: ParameterTypeSetI;
  control: ReturnType<typeof useForm<FormValues>>["control"];
  baseName: string;
  index: number;
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  const parameterType = allParameterTypes.find(
    (pt) => pt.id === parameterTypeId,
  );
  const valueType = parameterType?.valueType;
  const fieldName = `${baseName}.${index}.value` as any;

  if (valueType === ParameterValueTypeI.BOOLEAN) {
    return (
      <Controller
        control={control}
        name={fieldName}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    );
  }

  if (valueType === ParameterValueTypeI.NUMBER) {
    return <Input type="number" placeholder="Value" {...register(fieldName)} />;
  }

  return <Input placeholder="Value" {...register(fieldName)} />;
}

function ResourceQuantityFields({
  control,
  register,
  watch,
  baseName,
  allResourceTypes,
  allParameterTypes,
  showReady = false,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"];
  register: ReturnType<typeof useForm<FormValues>>["register"];
  watch: ReturnType<typeof useForm<FormValues>>["watch"];
  baseName: string;
  allResourceTypes: ResourceTypeI[];
  allParameterTypes: ParameterTypeSetI;
  showReady?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: baseName as any,
  });

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No resource quantities yet.
        </p>
      )}

      {fields.map((field, index) => {
        const watchedResourceTypeId = watch(
          `${baseName}.${index}.resourceTypeId` as any,
        );
        const selectedResourceType = allResourceTypes.find(
          (rt) => rt.id === watchedResourceTypeId,
        );
        const availableQuantityParamTypes = selectedResourceType
          ? allParameterTypes.filter((pt) =>
              selectedResourceType.quantityParameterTypeIds.includes(pt.id),
            )
          : allParameterTypes;

        const watchedStatus = showReady
          ? watch(`${baseName}.${index}.status` as any)
          : undefined;

        const statusBorderColor = {
          ready: "border-l-green-500",
          unavailable: "border-l-red-500",
          canceled: "border-l-gray-400",
          review: "border-l-amber-500",
        }[watchedStatus as string] ?? "";

        return (
          <Card
            key={field.id}
            className={showReady ? `border-l-4 ${statusBorderColor}` : ""}
          >
            <CardContent className="flex flex-col gap-3 pt-4">
              <div className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Resource Type</Label>
                  <Controller
                    control={control}
                    name={`${baseName}.${index}.resourceTypeId` as any}
                    rules={{ required: true }}
                    render={({ field: selectField }) => (
                      <Select
                        value={selectField.value}
                        onValueChange={selectField.onChange}
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
                    )}
                  />
                </div>
                {showReady && (
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label>Status</Label>
                    <Controller
                      control={control}
                      name={`${baseName}.${index}.status` as any}
                      render={({ field: statusField }) => (
                        <Select
                          value={statusField.value}
                          onValueChange={statusField.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ready">
                              <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-green-500" />
                                Ready
                              </span>
                            </SelectItem>
                            <SelectItem value="unavailable">
                              <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-red-500" />
                                Unavailable
                              </span>
                            </SelectItem>
                            <SelectItem value="canceled">
                              <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-gray-400" />
                                Canceled
                              </span>
                            </SelectItem>
                            <SelectItem value="review">
                              <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-amber-500" />
                                Review
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>

              <QuantityParameterList
                control={control}
                register={register}
                watch={watch}
                baseName={`${baseName}.${index}.quantityParameters`}
                availableParameterTypes={availableQuantityParamTypes}
                allParameterTypes={allParameterTypes}
              />
            </CardContent>
          </Card>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          append({
            resourceTypeId: "",
            quantityParameters: [],
            ...(showReady ? { status: "review" } : {}),
          } as any)
        }
      >
        <IconPlus className="size-4" />
        Add Resource
      </Button>
    </div>
  );
}

function QuantityParameterList({
  control,
  register,
  watch,
  baseName,
  availableParameterTypes,
  allParameterTypes,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"];
  register: ReturnType<typeof useForm<FormValues>>["register"];
  watch: ReturnType<typeof useForm<FormValues>>["watch"];
  baseName: string;
  availableParameterTypes: ParameterTypeSetI;
  allParameterTypes: ParameterTypeSetI;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: baseName as any,
  });

  const watchedParams = watch(baseName as any) ?? [];

  return (
    <div className="flex flex-col gap-2 pl-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">
          Quantity Parameters
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ parameterTypeId: "", value: "" } as any)}
        >
          <IconPlus className="size-3" />
          Add
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1.5">
            {index === 0 && <Label className="text-xs">Parameter Type</Label>}
            <Controller
              control={control}
              name={`${baseName}.${index}.parameterTypeId` as any}
              rules={{ required: true }}
              render={({ field: selectField }) => (
                <Select
                  value={selectField.value}
                  onValueChange={selectField.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParameterTypes.map((pt) => (
                      <SelectItem key={pt.id} value={pt.id}>
                        {pt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            {index === 0 && <Label className="text-xs">Value</Label>}
            <QuantityParameterValueInput
              parameterTypeId={watchedParams[index]?.parameterTypeId ?? ""}
              allParameterTypes={allParameterTypes}
              control={control}
              baseName={baseName}
              index={index}
              register={register}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function MappingFields({
  control,
  register,
  watch,
  mappingIndex,
  allResourceTypes,
  allParameterTypes,
  onRemove,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"];
  register: ReturnType<typeof useForm<FormValues>>["register"];
  watch: ReturnType<typeof useForm<FormValues>>["watch"];
  mappingIndex: number;
  allResourceTypes: ResourceTypeI[];
  allParameterTypes: ParameterTypeSetI;
  onRemove: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Mapping {mappingIndex + 1}</CardTitle>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <IconTrash className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label className="mb-2 block">Inputs</Label>
          <ResourceQuantityFields
            control={control}
            register={register}
            watch={watch}
            baseName={`mappings.${mappingIndex}.inputs`}
            allResourceTypes={allResourceTypes}
            allParameterTypes={allParameterTypes}
            showReady
          />
        </div>

        <Separator />

        <div>
          <Label className="mb-2 block">Outputs</Label>
          <ResourceQuantityFields
            control={control}
            register={register}
            watch={watch}
            baseName={`mappings.${mappingIndex}.outputs`}
            allResourceTypes={allResourceTypes}
            allParameterTypes={allParameterTypes}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function parseParameterValue(
  parameterTypeId: string,
  value: string,
  allParameterTypes: ParameterTypeSetI,
): unknown {
  const pt = allParameterTypes.find((p) => p.id === parameterTypeId);
  if (pt?.valueType === ParameterValueTypeI.NUMBER) return Number(value);
  if (pt?.valueType === ParameterValueTypeI.BOOLEAN) return value === "true";
  return value;
}

function toResourceQuantities(
  items: ResourceQuantityFormValues[],
  allParameterTypes: ParameterTypeSetI,
) {
  return items.map((item) => ({
    resourceTypeId: item.resourceTypeId,
    quantityParameters: item.quantityParameters.map((qp) => ({
      parameterTypeId: qp.parameterTypeId,
      value: parseParameterValue(
        qp.parameterTypeId,
        qp.value,
        allParameterTypes,
      ),
    })),
  }));
}

export function JobForm({
  initialData,
  allParameterTypes,
  allResourceTypes,
  onSubmit,
}: {
  initialData: Partial<JobI>;
  allParameterTypes: ParameterTypeSetI;
  allResourceTypes: ResourceTypeI[];
  onSubmit: (data: Partial<JobI>) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialData.name ?? "",
      mappings:
        initialData.mappings?.map((m) => ({
          inputs: m.inputs.map((rq) => ({
            resourceTypeId: rq.resourceTypeId,
            quantityParameters: rq.quantityParameters.map((qp) => ({
              parameterTypeId: qp.parameterTypeId,
              value: String(qp.value ?? ""),
            })),
            status: rq.status ?? "review",
          })),
          outputs: m.outputs.map((rq) => ({
            resourceTypeId: rq.resourceTypeId,
            quantityParameters: rq.quantityParameters.map((qp) => ({
              parameterTypeId: qp.parameterTypeId,
              value: String(qp.value ?? ""),
            })),
          })),
        })) ?? [],
      common:
        initialData.common?.map((rq) => ({
          resourceTypeId: rq.resourceTypeId,
          quantityParameters: rq.quantityParameters.map((qp) => ({
            parameterTypeId: qp.parameterTypeId,
            value: String(qp.value ?? ""),
          })),
        })) ?? [],
    },
  });

  const {
    fields: mappingFields,
    append: appendMapping,
    remove: removeMapping,
  } = useFieldArray({ control, name: "mappings" });

  const submit = handleSubmit((data) => {
    onSubmit({
      name: data.name,
      mappings: data.mappings.map((m) => ({
        inputs: toResourceQuantities(m.inputs, allParameterTypes).map(
          (rq, i) => ({
            ...rq,
            status: m.inputs[i].status ?? "review",
          }),
        ),
        outputs: toResourceQuantities(m.outputs, allParameterTypes),
      })),
      common: toResourceQuantities(data.common, allParameterTypes),
    });
  });

  return (
    <form onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>Job</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-name">Name</Label>
            <Input
              id="job-name"
              placeholder="e.g. Centrifugation, Incubation"
              aria-invalid={!!errors.name}
              {...register("name", { required: true })}
            />
          </div>

          <Separator />

          {/* Mappings */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Mappings</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendMapping({ inputs: [], outputs: [] })}
              >
                <IconPlus className="size-4" />
                Add Mapping
              </Button>
            </div>

            {mappingFields.length === 0 && (
              <p className="text-sm text-muted-foreground">No mappings yet.</p>
            )}

            {mappingFields.map((field, index) => (
              <MappingFields
                key={field.id}
                control={control}
                register={register}
                watch={watch}
                mappingIndex={index}
                allResourceTypes={allResourceTypes}
                allParameterTypes={allParameterTypes}
                onRemove={() => removeMapping(index)}
              />
            ))}
          </div>

          <Separator />

          {/* Common Resources */}
          <div className="flex flex-col gap-3">
            <Label>Common Resources</Label>
            <ResourceQuantityFields
              control={control}
              register={register}
              watch={watch}
              baseName="common"
              allResourceTypes={allResourceTypes}
              allParameterTypes={allParameterTypes}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
