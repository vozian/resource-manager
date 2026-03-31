import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
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

type FormValues = {
  name: string;
  constraintParameters: {
    parameterTypeId: string;
    value: string;
  }[];
  quantityParameterTypeIds: {
    id: string;
  }[];
};

function ConstraintValueInput({
  parameterTypeId,
  allParameterTypes,
  control,
  index,
  register,
}: {
  parameterTypeId: string;
  allParameterTypes: ParameterTypeSetI;
  control: ReturnType<typeof useForm<FormValues>>["control"];
  index: number;
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  const parameterType = allParameterTypes.find(
    (pt) => pt.id === parameterTypeId,
  );
  const valueType = parameterType?.valueType;

  if (valueType === ParameterValueTypeI.BOOLEAN) {
    return (
      <Controller
        control={control}
        name={`constraintParameters.${index}.value`}
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

  if (valueType === ParameterValueTypeI.NUMBER) {
    return (
      <Input
        type="number"
        placeholder="Value"
        {...register(`constraintParameters.${index}.value`, { required: true })}
      />
    );
  }

  return (
    <Input
      placeholder="Value"
      {...register(`constraintParameters.${index}.value`, { required: true })}
    />
  );
}

export function ResourceTypeForm({
  initialData,
  allParameterTypes,
  onSubmit,
}: {
  initialData: Partial<ResourceTypeI>;
  allParameterTypes: ParameterTypeSetI;
  onSubmit: (data: Partial<ResourceTypeI>) => void;
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
      constraintParameters:
        initialData.constraintParameters?.map((cp) => ({
          parameterTypeId: cp.parameterTypeId,
          value: String(cp.value ?? ""),
        })) ?? [],
      quantityParameterTypeIds:
        initialData.quantityParameterTypeIds?.map((id) => ({ id })) ?? [],
    },
  });

  const {
    fields: constraintFields,
    append: appendConstraint,
    remove: removeConstraint,
  } = useFieldArray({ control, name: "constraintParameters" });

  const {
    fields: quantityFields,
    append: appendQuantity,
    remove: removeQuantity,
  } = useFieldArray({ control, name: "quantityParameterTypeIds" });

  const watchedConstraints = watch("constraintParameters");

  const submit = handleSubmit((data) => {
    console.log("Form Data:", data);
    onSubmit({
      name: data.name,
      constraintParameters: data.constraintParameters.map((cp) => {
        const pt = allParameterTypes.find((p) => p.id === cp.parameterTypeId);
        let value: unknown = cp.value;
        if (pt?.valueType === ParameterValueTypeI.NUMBER) {
          value = Number(cp.value);
        } else if (pt?.valueType === ParameterValueTypeI.BOOLEAN) {
          value = cp.value === "true";
        }
        return { parameterTypeId: cp.parameterTypeId, value };
      }),
      quantityParameterTypeIds: data.quantityParameterTypeIds.map((q) => q.id),
    } as Partial<ResourceTypeI>);
  });

  return (
    <form onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>Resource Type</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rt-name">Name</Label>
            <Input
              id="rt-name"
              placeholder="e.g. Incubator, Centrifuge"
              aria-invalid={!!errors.name}
              {...register("name", { required: true })}
            />
          </div>

          <Separator />

          {/* Constraint Parameters */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Constraint Parameters</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendConstraint({ parameterTypeId: "", value: "" })
                }
              >
                <IconPlus className="size-4" />
                Add
              </Button>
            </div>

            {constraintFields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No constraint parameters yet.
              </p>
            )}

            {constraintFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  {index === 0 && <Label>Parameter Type</Label>}
                  <Controller
                    control={control}
                    name={`constraintParameters.${index}.parameterTypeId`}
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
                          {allParameterTypes.map((pt) => (
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
                  {index === 0 && <Label>Value</Label>}
                  <ConstraintValueInput
                    parameterTypeId={
                      watchedConstraints?.[index]?.parameterTypeId ?? ""
                    }
                    allParameterTypes={allParameterTypes}
                    control={control}
                    index={index}
                    register={register}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeConstraint(index)}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Quantity Parameter Types */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Quantity Parameter Types</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendQuantity({ id: "" })}
              >
                <IconPlus className="size-4" />
                Add
              </Button>
            </div>

            {quantityFields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No quantity parameter types yet.
              </p>
            )}

            {quantityFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  {index === 0 && <Label>Parameter Type</Label>}
                  <Controller
                    control={control}
                    name={`quantityParameterTypeIds.${index}.id`}
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
                          {allParameterTypes.map((pt) => (
                            <SelectItem key={pt.id} value={pt.id}>
                              {pt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuantity(index)}
                >
                  <IconTrash className="size-4" />
                </Button>
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
