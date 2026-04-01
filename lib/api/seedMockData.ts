import { ParameterValueTypeI } from "../core/types";
import { enrichEntityFields } from "./local-mock-api";

export function seedMockData() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allItems: any[] = [];

  function seedParameterType(name: string, valueType: ParameterValueTypeI) {
    const data = enrichEntityFields({ name, valueType });
    allItems.push({ type: "parameterType", data });
    return data;
  }

  // --- Parameter Types ---

  const category = seedParameterType("category", ParameterValueTypeI.STRING);
  const materialType = seedParameterType(
    "materialType",
    ParameterValueTypeI.STRING,
  );
  const machineType = seedParameterType(
    "machineType",
    ParameterValueTypeI.STRING,
  );
  const temperature = seedParameterType(
    "temperature",
    ParameterValueTypeI.NUMBER,
  );
  const duration = seedParameterType("duration", ParameterValueTypeI.NUMBER);
  const dnaCode = seedParameterType("dnaCode", ParameterValueTypeI.STRING);
  const concentration = seedParameterType(
    "concentration",
    ParameterValueTypeI.NUMBER,
  );
  const wellCount = seedParameterType("wellCount", ParameterValueTypeI.NUMBER);

  // --- Resource Types ---

  function seedResourceType(
    name: string,
    constraintParameters: { parameterTypeId: string; value: unknown }[],
    quantityParameterTypeIds: string[],
  ) {
    const data = enrichEntityFields({
      name,
      constraintParameters,
      quantityParameterTypeIds,
    });
    allItems.push({ type: "resourceType", data });
    return data;
  }

  // Materials — dnaCode and concentration are constraint parameters,
  // so each code/concentration combination is a distinct resource type.

  const twistDna100_ATCGATCG = seedResourceType(
    "Twist DNA (ATCGATCG, 100 ng/µL)",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Twist DNA" },
      { parameterTypeId: dnaCode.id, value: "ATCGATCG" },
      { parameterTypeId: concentration.id, value: 100 },
    ],
    [wellCount.id],
  );

  const twistDna100_GCTAGCTA = seedResourceType(
    "Twist DNA (GCTAGCTA, 100 ng/µL)",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Twist DNA" },
      { parameterTypeId: dnaCode.id, value: "GCTAGCTA" },
      { parameterTypeId: concentration.id, value: 100 },
    ],
    [wellCount.id],
  );

  const dilutedDna10_ATCGATCG = seedResourceType(
    "Diluted DNA (ATCGATCG, 10 ng/µL)",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Diluted DNA" },
      { parameterTypeId: dnaCode.id, value: "ATCGATCG" },
      { parameterTypeId: concentration.id, value: 10 },
    ],
    [wellCount.id],
  );

  const dilutedDna10_GCTAGCTA = seedResourceType(
    "Diluted DNA (GCTAGCTA, 10 ng/µL)",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Diluted DNA" },
      { parameterTypeId: dnaCode.id, value: "GCTAGCTA" },
      { parameterTypeId: concentration.id, value: 10 },
    ],
    [wellCount.id],
  );

  const protein5_ATCGATCG = seedResourceType(
    "Protein (ATCGATCG, 5 mg/mL)",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Protein" },
      { parameterTypeId: dnaCode.id, value: "ATCGATCG" },
      { parameterTypeId: concentration.id, value: 5 },
    ],
    [wellCount.id],
  );

  const protein5_GCTAGCTA = seedResourceType(
    "Protein (GCTAGCTA, 5 mg/mL)",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Protein" },
      { parameterTypeId: dnaCode.id, value: "GCTAGCTA" },
      { parameterTypeId: concentration.id, value: 5 },
    ],
    [wellCount.id],
  );

  const protein2_ATCGATCG = seedResourceType(
    "Protein (ATCGATCG, 2 mg/mL)",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Protein" },
      { parameterTypeId: dnaCode.id, value: "ATCGATCG" },
      { parameterTypeId: concentration.id, value: 2 },
    ],
    [wellCount.id],
  );

  const protein2_GCTAGCTA = seedResourceType(
    "Protein (GCTAGCTA, 2 mg/mL)",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Protein" },
      { parameterTypeId: dnaCode.id, value: "GCTAGCTA" },
      { parameterTypeId: concentration.id, value: 2 },
    ],
    [wellCount.id],
  );

  const antigen10 = seedResourceType(
    "Antigen (10 µg/mL)",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Antigen" },
      { parameterTypeId: concentration.id, value: 10 },
    ],
    [wellCount.id],
  );

  const targetMeasurement = seedResourceType(
    "Target Measurement",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Biosensor" },
    ],
    [wellCount.id],
  );

  // Machines
  const expressionMachine = seedResourceType(
    "Expression Machine",
    [
      { parameterTypeId: category.id, value: "machine" },
      { parameterTypeId: machineType.id, value: "expression machine" },
    ],
    [duration.id, temperature.id],
  );

  const liquidHandler = seedResourceType(
    "Liquid Handler",
    [
      { parameterTypeId: category.id, value: "machine" },
      { parameterTypeId: machineType.id, value: "liquid handler" },
    ],
    [duration.id],
  );

  const bliMachine = seedResourceType(
    "BLI Machine",
    [
      { parameterTypeId: category.id, value: "machine" },
      { parameterTypeId: machineType.id, value: "BLI machine" },
    ],
    [duration.id],
  );

  // --- Jobs ---

  function seedJob(
    name: string,
    mappings: { inputs: object[]; outputs: object[] }[],
    common: object[],
  ) {
    const data = enrichEntityFields({ name, mappings, common });
    allItems.push({ type: "job", data });
    return data;
  }

  // DNA Dilution: two mappings (one per DNA code), same Liquid Handler
  seedJob(
    "DNA Dilution",
    [
      {
        inputs: [
          {
            resourceTypeId: twistDna100_ATCGATCG.id,
            status: "ready" as const,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 96 },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: dilutedDna10_ATCGATCG.id,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 96 },
            ],
          },
        ],
      },
      {
        inputs: [
          {
            resourceTypeId: twistDna100_GCTAGCTA.id,
            status: "ready" as const,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 96 },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: dilutedDna10_GCTAGCTA.id,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 96 },
            ],
          },
        ],
      },
    ],
    [
      {
        resourceTypeId: liquidHandler.id,
        quantityParameters: [{ parameterTypeId: duration.id, value: 1800 }],
      },
    ],
  );

  // Protein Expression: two mappings (one per DNA code), same Expression Machine
  // Shares the same Expression Machine settings as "Protein Expression (Low Temp)" below
  // but with different temperature
  seedJob(
    "Protein Expression",
    [
      {
        inputs: [
          {
            resourceTypeId: dilutedDna10_ATCGATCG.id,
            status: "ready" as const,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 96 },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: protein5_ATCGATCG.id,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 96 },
            ],
          },
        ],
      },
      {
        inputs: [
          {
            resourceTypeId: dilutedDna10_GCTAGCTA.id,
            status: "review" as const,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 96 },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: protein5_GCTAGCTA.id,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 96 },
            ],
          },
        ],
      },
    ],
    [
      {
        resourceTypeId: expressionMachine.id,
        quantityParameters: [
          { parameterTypeId: duration.id, value: 86400 },
          { parameterTypeId: temperature.id, value: 37 },
        ],
      },
    ],
  );

  // Protein Expression (Low Temp): same common params shape (Expression Machine)
  // but at lower temperature — different mappings target ATCGATCG only at 2 mg/mL output
  seedJob(
    "Protein Expression (Low Temp)",
    [
      {
        inputs: [
          {
            resourceTypeId: dilutedDna10_ATCGATCG.id,
            status: "review" as const,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 48 },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: protein2_ATCGATCG.id,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 48 },
            ],
          },
        ],
      },
    ],
    [
      {
        resourceTypeId: expressionMachine.id,
        quantityParameters: [
          { parameterTypeId: duration.id, value: 86400 },
          { parameterTypeId: temperature.id, value: 25 },
        ],
      },
    ],
  );

  // BLI Binding Assay: two mappings (one per DNA code), same BLI Machine
  seedJob(
    "BLI Binding Assay",
    [
      {
        inputs: [
          {
            resourceTypeId: protein2_ATCGATCG.id,
            status: "ready" as const,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 48 },
            ],
          },
          {
            resourceTypeId: antigen10.id,
            status: "ready" as const,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 48 },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: targetMeasurement.id,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 48 },
            ],
          },
        ],
      },
      {
        inputs: [
          {
            resourceTypeId: protein2_GCTAGCTA.id,
            status: "review" as const,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 48 },
            ],
          },
          {
            resourceTypeId: antigen10.id,
            status: "ready" as const,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 48 },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: targetMeasurement.id,
            quantityParameters: [
              { parameterTypeId: wellCount.id, value: 48 },
            ],
          },
        ],
      },
    ],
    [
      {
        resourceTypeId: bliMachine.id,
        quantityParameters: [{ parameterTypeId: duration.id, value: 7200 }],
      },
    ],
  );

  return allItems;
}
