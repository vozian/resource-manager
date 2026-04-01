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
};

type MappingForm = {
  input: ResourceQuantityForm;
  output: ResourceQuantityForm;
};

type FormValues = {
  name: string;
  mappings: MappingForm[];
  common: ResourceQuantityForm[];
};

function toRqForm(
  rq: { resourceTypeId: string; quantityParameters: { parameterTypeId: string; value: unknown }[] } | undefined,
): ResourceQuantityForm {
  if (!rq) return { resourceTypeId: "", quantityParameters: [] };
  return {
    resourceTypeId: rq.resourceTypeId,
    quantityParameters: rq.quantityParameters.map((qp) => ({
      parameterTypeId: qp.parameterTypeId,
      value: String(qp.value ?? ""),
    })),
  };
}

function ParameterValueInput({
  parameterTypeId,
  allParameterTypes,
  control,
  basePath,
  paramIndex,
  register,
}: {
  parameterTypeId: string;
  allParameterTypes: ParameterTypeSetI;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  basePath: string;
  paramIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
}) {
  const pt = allParameterTypes.find((p) => p.id === parameterTypeId);
  const name = `${basePath}.quantityParameters.${paramIndex}.value`;

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

  return <Input placeholder="Value" {...register(name, { required: true })} />;
}

function ResourceQuantityFields({
  basePath,
  label,
  control,
  register,
  watch,
  allParameterTypes,
  allResourceTypes,
}: {
  basePath: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  allParameterTypes: ParameterTypeSetI;
  allResourceTypes: ResourceTypeI[];
}) {
  const selectedResourceTypeId = watch(`${basePath}.resourceTypeId`) ?? "";
  const selectedResourceType = allResourceTypes.find(
    (rt) => rt.id === selectedResourceTypeId,
  );
  const quantityParamTypeIds =
    selectedResourceType?.quantityParameterTypeIds ?? [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">{label}</Label>
        <Controller
          control={control}
          name={`${basePath}.resourceTypeId`}
          rules={{ required: true }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
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
      {quantityParamTypeIds.length > 0 && (
        <div className="flex flex-col gap-2 ml-4">
          {quantityParamTypeIds.map((ptId, paramIndex) => {
            const pt = allParameterTypes.find((p) => p.id === ptId);
            return (
              <div key={ptId} className="flex flex-col gap-1">
                <Label className="text-xs">{pt?.name ?? ptId}</Label>
                <input
                  type="hidden"
                  value={ptId}
                  {...register(
                    `${basePath}.quantityParameters.${paramIndex}.parameterTypeId`,
                  )}
                />
                <ParameterValueInput
                  parameterTypeId={ptId}
                  allParameterTypes={allParameterTypes}
                  control={control}
                  basePath={basePath}
                  paramIndex={paramIndex}
                  register={register}
                />
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
      mappings:
        initialData.mappings?.map((m) => ({
          input: toRqForm(m.input),
          output: toRqForm(m.output),
        })) ?? [],
      common: initialData.common?.map(toRqForm) ?? [],
    },
  });

  const {
    fields: mappingFields,
    append: appendMapping,
    remove: removeMapping,
  } = useFieldArray({ control, name: "mappings" });

  const {
    fields: commonFields,
    append: appendCommon,
    remove: removeCommon,
  } = useFieldArray({ control, name: "common" });

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

  const submit = handleSubmit((data) => {
    onSubmit({
      name: data.name,
      mappings: data.mappings.map((m) => ({
        input: {
          resourceTypeId: m.input.resourceTypeId,
          quantityParameters: coerceParams(m.input.quantityParameters),
        },
        output: {
          resourceTypeId: m.output.resourceTypeId,
          quantityParameters: coerceParams(m.output.quantityParameters),
        },
      })),
      common: data.common.map((c) => ({
        resourceTypeId: c.resourceTypeId,
        quantityParameters: coerceParams(c.quantityParameters),
      })),
    } as Partial<JobI>);
  });

  const emptyRq: ResourceQuantityForm = {
    resourceTypeId: "",
    quantityParameters: [],
  };

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

          {/* Mappings */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Resource Mappings</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendMapping({ input: { ...emptyRq }, output: { ...emptyRq } })
                }
              >
                <IconPlus className="size-4" />
                Add
              </Button>
            </div>

            {mappingFields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No resource mappings yet.
              </p>
            )}

            {mappingFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-md border p-3 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Mapping {index + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMapping(index)}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ResourceQuantityFields
                    basePath={`mappings.${index}.input`}
                    label="Input"
                    control={control}
                    register={register}
                    watch={watch}
                    allParameterTypes={allParameterTypes}
                    allResourceTypes={allResourceTypes}
                  />
                  <ResourceQuantityFields
                    basePath={`mappings.${index}.output`}
                    label="Output"
                    control={control}
                    register={register}
                    watch={watch}
                    allParameterTypes={allParameterTypes}
                    allResourceTypes={allResourceTypes}
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Common Resources */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Common Resources</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendCommon({ ...emptyRq })}
              >
                <IconPlus className="size-4" />
                Add
              </Button>
            </div>

            {commonFields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No common resources yet.
              </p>
            )}

            {commonFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-md border p-3 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <ResourceQuantityFields
                    basePath={`common.${index}`}
                    label="Resource"
                    control={control}
                    register={register}
                    watch={watch}
                    allParameterTypes={allParameterTypes}
                    allResourceTypes={allResourceTypes}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-auto"
                    onClick={() => removeCommon(index)}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
