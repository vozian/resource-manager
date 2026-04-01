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

  // Materials
  const twistDna = seedResourceType(
    "Twist DNA",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Twist DNA" },
    ],
    [wellCount.id, concentration.id, dnaCode.id],
  );

  const dilutedDna = seedResourceType(
    "Diluted DNA",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Diluted DNA" },
    ],
    [wellCount.id, concentration.id, dnaCode.id],
  );

  const protein = seedResourceType(
    "Protein",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Protein" },
    ],
    [wellCount.id, concentration.id, dnaCode.id],
  );

  const antigen = seedResourceType(
    "Antigen",
    [
      { parameterTypeId: category.id, value: "material" },
      { parameterTypeId: materialType.id, value: "Antigen" },
    ],
    [wellCount.id, concentration.id],
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

  // DNA Dilution: Twist DNA → Diluted DNA, using Liquid Handler
  seedJob(
    "DNA Dilution",
    [
      {
        inputs: [
          {
            resourceTypeId: twistDna.id,
            quantityParameters: [
              { parameterTypeId: concentration.id, value: 100 },
              { parameterTypeId: dnaCode.id, value: "ATCGATCG" },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: dilutedDna.id,
            quantityParameters: [
              { parameterTypeId: concentration.id, value: 10 },
              { parameterTypeId: dnaCode.id, value: "ATCGATCG" },
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

  // Protein Expression: Diluted DNA → Protein, using Expression Machine
  seedJob(
    "Protein Expression",
    [
      {
        inputs: [
          {
            resourceTypeId: dilutedDna.id,
            quantityParameters: [
              { parameterTypeId: concentration.id, value: 10 },
              { parameterTypeId: dnaCode.id, value: "ATCGATCG" },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: protein.id,
            quantityParameters: [
              { parameterTypeId: concentration.id, value: 5 },
              { parameterTypeId: dnaCode.id, value: "ATCGATCG" },
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

  // BLI Binding Assay: Protein + Antigen → Target Measurement, using BLI Machine
  seedJob(
    "BLI Binding Assay",
    [
      {
        inputs: [
          {
            resourceTypeId: protein.id,
            quantityParameters: [
              { parameterTypeId: concentration.id, value: 2 },
              { parameterTypeId: dnaCode.id, value: "ATCGATCG" },
            ],
          },
          {
            resourceTypeId: antigen.id,
            quantityParameters: [
              { parameterTypeId: concentration.id, value: 10 },
            ],
          },
        ],
        outputs: [
          {
            resourceTypeId: targetMeasurement.id,
            quantityParameters: [],
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
