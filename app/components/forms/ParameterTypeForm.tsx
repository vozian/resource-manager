import { useForm, Controller } from "react-hook-form";

import { OmitEntityFields } from "../utils/types";
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
import { ParameterTypeI, ParameterValueTypeI } from "@/lib/core/types";

type FormValues = OmitEntityFields<ParameterTypeI>;

export function ParameterTypeForm({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<ParameterTypeI>;
  onSubmit: (data: OmitEntityFields<ParameterTypeI>) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialData?.name ?? "",
      valueType: initialData?.valueType ?? ParameterValueTypeI.STRING,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Parameter Type</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Temperature, Volume"
              aria-invalid={!!errors.name}
              {...register("name", { required: true })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Value Type</Label>
            <Controller
              control={control}
              name="valueType"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ParameterValueTypeI.STRING}>
                      String
                    </SelectItem>
                    <SelectItem value={ParameterValueTypeI.NUMBER}>
                      Number
                    </SelectItem>
                    <SelectItem value={ParameterValueTypeI.BOOLEAN}>
                      Boolean
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
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
