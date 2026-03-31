import { ParameterValueTypeI } from "../core/types";
import { enrichEntityFields } from "./local-mock-api";

export function seedMockData() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allItems: any[] = [];
  // Helper to create and store a parameter type, returning its enriched form
  function seedParameterType(name: string, valueType: ParameterValueTypeI) {
    const data = enrichEntityFields({ name, valueType });
    allItems.push({ type: "parameterType", data });
    return data;
  }

  // --- Parameter Types ---

  // Classification
  const resourceCategory = seedParameterType(
    "resourceCategory",
    ParameterValueTypeI.STRING,
  );
  const materialType = seedParameterType(
    "materialType",
    ParameterValueTypeI.STRING,
  );
  const machineType = seedParameterType(
    "machineType",
    ParameterValueTypeI.STRING,
  );
  const role = seedParameterType("role", ParameterValueTypeI.STRING);

  const liquidType = seedParameterType(
    "liquidType",
    ParameterValueTypeI.STRING,
  );

  // Identity
  const dnaCode = seedParameterType("dnaCode", ParameterValueTypeI.STRING);
  const proteinCode = seedParameterType(
    "proteinCode",
    ParameterValueTypeI.STRING,
  );
  const model = seedParameterType("model", ParameterValueTypeI.STRING);

  // Quantity / Usage
  const volume = seedParameterType("volume", ParameterValueTypeI.NUMBER);
  const concentration = seedParameterType(
    "concentration",
    ParameterValueTypeI.NUMBER,
  );
  const duration = seedParameterType("duration", ParameterValueTypeI.NUMBER);
  const temperature = seedParameterType(
    "temperature",
    ParameterValueTypeI.NUMBER,
  );
  const quantity = seedParameterType("quantity", ParameterValueTypeI.NUMBER);
  const rpmSpeed = seedParameterType("rpmSpeed", ParameterValueTypeI.NUMBER);
  const wellCount = seedParameterType("wellCount", ParameterValueTypeI.NUMBER);
  const isQcPassed = seedParameterType(
    "isQcPassed",
    ParameterValueTypeI.BOOLEAN,
  );

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
  seedResourceType(
    "DNA Sample",
    [
      { parameterTypeId: resourceCategory.id, value: "material" },
      { parameterTypeId: materialType.id, value: "dna" },
      { parameterTypeId: dnaCode.id, value: "DY-4521" },
    ],
    [volume.id, concentration.id],
  );

  seedResourceType(
    "Protein Sample",
    [
      { parameterTypeId: resourceCategory.id, value: "material" },
      { parameterTypeId: materialType.id, value: "protein" },
      { parameterTypeId: proteinCode.id, value: "PRO-8831" },
    ],
    [volume.id, concentration.id],
  );

  seedResourceType(
    "Antigen",
    [
      { parameterTypeId: resourceCategory.id, value: "material" },
      { parameterTypeId: materialType.id, value: "antigen" },
    ],
    [volume.id, concentration.id, isQcPassed.id],
  );

  seedResourceType(
    "Reagent",
    [
      { parameterTypeId: resourceCategory.id, value: "material" },
      { parameterTypeId: materialType.id, value: "reagent" },
    ],
    [volume.id, quantity.id],
  );

  // Plates
  seedResourceType(
    "Plate Well",
    [
      { parameterTypeId: resourceCategory.id, value: "plate" },
      { parameterTypeId: liquidType.id, value: "dna" },
    ],
    [wellCount.id, volume.id, concentration.id],
  );

  // Machines
  seedResourceType(
    "Liquid Handler",
    [
      { parameterTypeId: resourceCategory.id, value: "machine" },
      { parameterTypeId: machineType.id, value: "liquid-handler" },
      { parameterTypeId: model.id, value: "Hamilton STAR" },
    ],
    [duration.id],
  );

  seedResourceType(
    "Incubator",
    [
      { parameterTypeId: resourceCategory.id, value: "machine" },
      { parameterTypeId: machineType.id, value: "incubator" },
      { parameterTypeId: model.id, value: "Thermo HERAcell" },
    ],
    [duration.id, temperature.id, rpmSpeed.id],
  );

  seedResourceType(
    "BLI Instrument",
    [
      { parameterTypeId: resourceCategory.id, value: "machine" },
      { parameterTypeId: machineType.id, value: "bli-instrument" },
      { parameterTypeId: model.id, value: "Octet RED96" },
    ],
    [duration.id],
  );

  seedResourceType(
    "Centrifuge",
    [
      { parameterTypeId: resourceCategory.id, value: "machine" },
      { parameterTypeId: machineType.id, value: "centrifuge" },
      { parameterTypeId: model.id, value: "Eppendorf 5810R" },
    ],
    [duration.id, rpmSpeed.id],
  );

  // Humans
  seedResourceType(
    "Lab Technician",
    [
      { parameterTypeId: resourceCategory.id, value: "human" },
      { parameterTypeId: role.id, value: "technician" },
    ],
    [duration.id],
  );

  return allItems;
}
