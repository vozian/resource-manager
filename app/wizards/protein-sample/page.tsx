"use client";

import { useState } from "react";
import { useApi } from "@/app/components/providers/ApiProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/app/components/containers/card";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input-fields/input";
import { Label } from "@/app/components/label";
import { Separator } from "@/app/components/separator";
import { IconArrowLeft, IconPlus, IconTrash } from "@tabler/icons-react";
import { executeProteinSampleWizard, ProteinSample } from "./execute";

export default function Page() {
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [samples, setSamples] = useState<ProteinSample[]>([
    { dnaCode: "", concentration: 5 },
  ]);

  const addSample = () => {
    setSamples((prev) => [...prev, { dnaCode: "", concentration: 5 }]);
  };

  const removeSample = (index: number) => {
    setSamples((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSample = (
    index: number,
    field: keyof ProteinSample,
    value: string,
  ) => {
    setSamples((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              [field]: field === "concentration" ? Number(value) : value,
            }
          : s,
      ),
    );
  };

  const { mutate: run, isPending } = useMutation({
    mutationFn: () => executeProteinSampleWizard(api, samples),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["resourceTypes"] });
      queryClient.invalidateQueries({ queryKey: ["parameterTypes"] });
      router.push(`/entities/jobs/${result.dilutionJobId}`);
    },
  });

  const isValid =
    samples.length > 0 &&
    samples.every((s) => s.dnaCode.trim() && s.concentration > 0);

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/wizards">
          <IconArrowLeft className="size-4" />
          All wizards
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Protein Sample Wizard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Specify the protein samples you need. The wizard will create two
            jobs: <strong>DNA Dilution</strong> (Twist DNA → Diluted DNA) and{" "}
            <strong>Protein Expression</strong> (Diluted DNA → Protein), with
            one mapping per sample in each job.
          </p>

          <Separator />

          <div className="flex flex-col gap-3">
            <Label>Samples</Label>

            {samples.map((sample, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  {index === 0 && <Label className="text-xs">DNA Code</Label>}
                  <Input
                    placeholder="e.g. ATCGATCG"
                    value={sample.dnaCode}
                    onChange={(e) =>
                      updateSample(index, "dnaCode", e.target.value)
                    }
                  />
                </div>
                <div className="flex w-40 flex-col gap-1.5">
                  {index === 0 && (
                    <Label className="text-xs">
                      Target Concentration (mg/mL)
                    </Label>
                  )}
                  <Input
                    type="number"
                    placeholder="5"
                    value={sample.concentration}
                    onChange={(e) =>
                      updateSample(index, "concentration", e.target.value)
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={samples.length === 1}
                  onClick={() => removeSample(index)}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={addSample}
            >
              <IconPlus className="size-4" />
              Add Sample
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Jobs that will be created:
            </p>
            <ul className="ml-4 list-disc">
              <li>
                <strong>DNA Dilution</strong> — {samples.length} mapping(s),
                Twist DNA (100 ng/µL) → Diluted DNA (10 ng/µL). Common: Liquid
                Handler (30 min).
              </li>
              <li>
                <strong>Protein Expression</strong> — {samples.length}{" "}
                mapping(s), Diluted DNA → Protein at target concentration.
                Common: Expression Machine (24h, 37°C).
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled={!isValid || isPending} onClick={() => run()}>
            {isPending ? "Creating..." : "Create Jobs"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
