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

type QuantityParameterForm = {
  parameterTypeId: string;
  value: string;
};

type ResourceQuantityForm = {
  resourceTypeId: string;
  quantityParameters: QuantityParameterForm[];
  ready: boolean;
};

type FormValues = {
  name: string;
  inputs: ResourceQuantityForm[];
  outputs: ResourceQuantityForm[];
};

function ParameterValueInput({
  parameterTypeId,
  allParameterTypes,
  control,
  fieldArrayName,
  rqIndex,
  paramIndex,
  register,
}: {
  parameterTypeId: string;
  allParameterTypes: ParameterTypeSetI;
  control: ReturnType<typeof useForm<FormValues>>["control"];
  fieldArrayName: "inputs" | "outputs";
  rqIndex: number;
  paramIndex: number;
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  const pt = allParameterTypes.find((p) => p.id === parameterTypeId);
  const name =
    `${fieldArrayName}.${rqIndex}.quantityParameters.${paramIndex}.value` as const;

  if (pt?.valueType === ParameterValueTypeI.BOOLEAN) {
    return (
      <Controller
        control={control}
        name={name}
        rules={{ required: true }}
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

  if (pt?.valueType === ParameterValueTypeI.NUMBER) {
    return (
      <Input
        type="number"
        placeholder="Value"
        {...register(name, { required: true })}
      />
    );
  }

  return (
    <Input
      placeholder="Value"
      {...register(name, { required: true })}
    />
  );
}

function ResourceQuantitySection({
  title,
  fieldArrayName,
  fields,
  append,
  remove,
  control,
  register,
  watch,
  allParameterTypes,
  allResourceTypes,
}: {
  title: string;
  fieldArrayName: "inputs" | "outputs";
  fields: { id: string }[];
  append: (value: ResourceQuantityForm) => void;
  remove: (index: number) => void;
  control: ReturnType<typeof useForm<FormValues>>["control"];
  register: ReturnType<typeof useForm<FormValues>>["register"];
  watch: ReturnType<typeof useForm<FormValues>>["watch"];
  allParameterTypes: ParameterTypeSetI;
  allResourceTypes: ResourceTypeI[];
}) {
  const watchedItems = watch(fieldArrayName);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ resourceTypeId: "", quantityParameters: [], ready: false })
          }
        >
          <IconPlus className="size-4" />
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No {title.toLowerCase()} yet.</p>
      )}

      {fields.map((field, rqIndex) => {
        const selectedResourceTypeId =
          watchedItems?.[rqIndex]?.resourceTypeId ?? "";
        const selectedResourceType = allResourceTypes.find(
          (rt) => rt.id === selectedResourceTypeId,
        );
        const quantityParamTypeIds =
          selectedResourceType?.quantityParameterTypeIds ?? [];

        return (
          <ResourceQuantityRow
            key={field.id}
            fieldArrayName={fieldArrayName}
            rqIndex={rqIndex}
            control={control}
            register={register}
            allResourceTypes={allResourceTypes}
            allParameterTypes={allParameterTypes}
            quantityParamTypeIds={quantityParamTypeIds}
            watchedParams={watchedItems?.[rqIndex]?.quantityParameters ?? []}
            onRemove={() => remove(rqIndex)}
            onResourceTypeChange={(resourceTypeId: string) => {
              const rt = allResourceTypes.find((r) => r.id === resourceTypeId);
              const paramTypeIds = rt?.quantityParameterTypeIds ?? [];
              // This is handled by the Controller's onChange + setValue below
              return paramTypeIds;
            }}
          />
        );
      })}
    </div>
  );
}

function ResourceQuantityRow({
  fieldArrayName,
  rqIndex,
  control,
  register,
  allResourceTypes,
  allParameterTypes,
  quantityParamTypeIds,
  watchedParams,
  onRemove,
}: {
  fieldArrayName: "inputs" | "outputs";
  rqIndex: number;
  control: ReturnType<typeof useForm<FormValues>>["control"];
  register: ReturnType<typeof useForm<FormValues>>["register"];
  allResourceTypes: ResourceTypeI[];
  allParameterTypes: ParameterTypeSetI;
  quantityParamTypeIds: string[];
  watchedParams: QuantityParameterForm[];
  onRemove: () => void;
  onResourceTypeChange: (resourceTypeId: string) => string[];
}) {
  return (
    <div className="rounded-md border p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Resource Type</Label>
          <Controller
            control={control}
            name={`${fieldArrayName}.${rqIndex}.resourceTypeId`}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
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
        <div className="flex flex-col gap-1.5">
          <Label>Ready</Label>
          <Controller
            control={control}
            name={`${fieldArrayName}.${rqIndex}.ready`}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(v) => field.onChange(v === "true")}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-auto"
          onClick={onRemove}
        >
          <IconTrash className="size-4" />
        </Button>
      </div>

      {quantityParamTypeIds.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground text-xs">
            Quantity Parameters
          </Label>
          {quantityParamTypeIds.map((ptId, paramIndex) => {
            const pt = allParameterTypes.find((p) => p.id === ptId);
            // Ensure the hidden parameterTypeId is registered
            const currentParam = watchedParams[paramIndex];
            if (!currentParam || currentParam.parameterTypeId !== ptId) {
              // Will be set via defaultValue in the hidden input
            }
            return (
              <div key={ptId} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <Label className="text-xs">{pt?.name ?? ptId}</Label>
                  <input
                    type="hidden"
                    value={ptId}
                    {...register(
                      `${fieldArrayName}.${rqIndex}.quantityParameters.${paramIndex}.parameterTypeId`,
                    )}
                  />
                  <ParameterValueInput
                    parameterTypeId={ptId}
                    allParameterTypes={allParameterTypes}
                    control={control}
                    fieldArrayName={fieldArrayName}
                    rqIndex={rqIndex}
                    paramIndex={paramIndex}
                    register={register}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
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
      inputs:
        initialData.inputs?.map((inp) => ({
          resourceTypeId: inp.resourceTypeId,
          quantityParameters: inp.quantityParameters.map((qp) => ({
            parameterTypeId: qp.parameterTypeId,
            value: String(qp.value ?? ""),
          })),
          ready: inp.ready,
        })) ?? [],
      outputs:
        initialData.outputs?.map((out) => ({
          resourceTypeId: out.resourceTypeId,
          quantityParameters: out.quantityParameters.map((qp) => ({
            parameterTypeId: qp.parameterTypeId,
            value: String(qp.value ?? ""),
          })),
          ready: out.ready,
        })) ?? [],
    },
  });

  const {
    fields: inputFields,
    append: appendInput,
    remove: removeInput,
  } = useFieldArray({ control, name: "inputs" });

  const {
    fields: outputFields,
    append: appendOutput,
    remove: removeOutput,
  } = useFieldArray({ control, name: "outputs" });

  const submit = handleSubmit((data) => {
    const coerceParams = (params: QuantityParameterForm[]) =>
      params.map((qp) => {
        const pt = allParameterTypes.find((p) => p.id === qp.parameterTypeId);
        let value: unknown = qp.value;
        if (pt?.valueType === ParameterValueTypeI.NUMBER) {
          value = Number(qp.value);
        } else if (pt?.valueType === ParameterValueTypeI.BOOLEAN) {
          value = qp.value === "true";
        }
        return { parameterTypeId: qp.parameterTypeId, value };
      });

    onSubmit({
      name: data.name,
      inputs: data.inputs.map((inp) => ({
        resourceTypeId: inp.resourceTypeId,
        quantityParameters: coerceParams(inp.quantityParameters),
        ready: inp.ready,
      })),
      outputs: data.outputs.map((out) => ({
        resourceTypeId: out.resourceTypeId,
        quantityParameters: coerceParams(out.quantityParameters),
        ready: out.ready,
      })),
    } as Partial<JobI>);
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
              placeholder="e.g. PCR Amplification, Cell Culture"
              aria-invalid={!!errors.name}
              {...register("name", { required: true })}
            />
          </div>

          <Separator />

          <ResourceQuantitySection
            title="Inputs"
            fieldArrayName="inputs"
            fields={inputFields}
            append={appendInput}
            remove={removeInput}
            control={control}
            register={register}
            watch={watch}
            allParameterTypes={allParameterTypes}
            allResourceTypes={allResourceTypes}
          />

          <Separator />

          <ResourceQuantitySection
            title="Outputs"
            fieldArrayName="outputs"
            fields={outputFields}
            append={appendOutput}
            remove={removeOutput}
            control={control}
            register={register}
            watch={watch}
            allParameterTypes={allParameterTypes}
            allResourceTypes={allResourceTypes}
          />
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
