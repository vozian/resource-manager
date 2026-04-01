/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ParameterTypeI,
  ParameterValueTypeI,
  ResourceTypeI,
} from "@/lib/core/types";
import { OmitEntityFields } from "@/app/components/utils/types";

type ApiClient = {
  getAllParameterTypes: () => Promise<ParameterTypeI[]>;
  createParameterType: (
    pt: OmitEntityFields<ParameterTypeI>,
  ) => Promise<ParameterTypeI>;
  getAllResourceTypes: () => Promise<ResourceTypeI[]>;
  createResourceType: (
    rt: OmitEntityFields<ResourceTypeI>,
  ) => Promise<ResourceTypeI>;
  createJob: (job: OmitEntityFields<any>) => Promise<any>;
};

export type ProteinSample = {
  dnaCode: string;
  concentration: number;
};

// Defaults
const TWIST_DNA_CONCENTRATION = 100; // ng/µL
const DILUTED_DNA_CONCENTRATION = 10; // ng/µL
const DEFAULT_WELL_COUNT = 1;
const LIQUID_HANDLER_DURATION = 1800; // seconds
const EXPRESSION_DURATION = 86400; // 24 hours
const EXPRESSION_TEMPERATURE = 37; // °C

async function findOrCreateParameterType(
  api: ApiClient,
  allParamTypes: ParameterTypeI[],
  name: string,
  valueType: ParameterValueTypeI,
): Promise<ParameterTypeI> {
  const existing = allParamTypes.find((pt) => pt.name === name);
  if (existing) return existing;
  const created = await api.createParameterType({ name, valueType });
  allParamTypes.push(created);
  return created;
}

async function findOrCreateResourceType(
  api: ApiClient,
  allResourceTypes: ResourceTypeI[],
  name: string,
  constraintParameters: { parameterTypeId: string; value: unknown }[],
  quantityParameterTypeIds: string[],
): Promise<ResourceTypeI> {
  // Match by constraint parameters (same set of parameterTypeId:value pairs)
  const existing = allResourceTypes.find((rt) => {
    if (rt.constraintParameters.length !== constraintParameters.length)
      return false;
    return constraintParameters.every((cp) =>
      rt.constraintParameters.some(
        (rcp) =>
          rcp.parameterTypeId === cp.parameterTypeId && rcp.value === cp.value,
      ),
    );
  });
  if (existing) return existing;

  const created = await api.createResourceType({
    name,
    constraintParameters,
    quantityParameterTypeIds,
  });
  allResourceTypes.push(created);
  return created;
}

export async function executeProteinSampleWizard(
  api: ApiClient,
  samples: ProteinSample[],
): Promise<{ dilutionJobId: string; expressionJobId: string }> {
  // Fetch current state
  const allParamTypes = await api.getAllParameterTypes();
  const allResourceTypes = await api.getAllResourceTypes();

  // Ensure parameter types exist
  const category = await findOrCreateParameterType(
    api,
    allParamTypes,
    "category",
    ParameterValueTypeI.STRING,
  );
  const materialType = await findOrCreateParameterType(
    api,
    allParamTypes,
    "materialType",
    ParameterValueTypeI.STRING,
  );
  const machineType = await findOrCreateParameterType(
    api,
    allParamTypes,
    "machineType",
    ParameterValueTypeI.STRING,
  );
  const dnaCodeParam = await findOrCreateParameterType(
    api,
    allParamTypes,
    "dnaCode",
    ParameterValueTypeI.STRING,
  );
  const concentrationParam = await findOrCreateParameterType(
    api,
    allParamTypes,
    "concentration",
    ParameterValueTypeI.NUMBER,
  );
  const wellCount = await findOrCreateParameterType(
    api,
    allParamTypes,
    "wellCount",
    ParameterValueTypeI.NUMBER,
  );
  const duration = await findOrCreateParameterType(
    api,
    allParamTypes,
    "duration",
    ParameterValueTypeI.NUMBER,
  );
  const temperature = await findOrCreateParameterType(
    api,
    allParamTypes,
    "temperature",
    ParameterValueTypeI.NUMBER,
  );

  // Ensure machine resource types exist
  const liquidHandler = await findOrCreateResourceType(
    api,
    allResourceTypes,
    "Liquid Handler",
    [
      { parameterTypeId: category.id, value: "machine" },
      { parameterTypeId: machineType.id, value: "liquid handler" },
    ],
    [duration.id],
  );

  const expressionMachine = await findOrCreateResourceType(
    api,
    allResourceTypes,
    "Expression Machine",
    [
      { parameterTypeId: category.id, value: "machine" },
      { parameterTypeId: machineType.id, value: "expression machine" },
    ],
    [duration.id, temperature.id],
  );

  // Build mappings for each sample
  const dilutionMappings = [];
  const expressionMappings = [];

  for (const sample of samples) {
    // Find/create resource types for this sample's pipeline
    const twistDna = await findOrCreateResourceType(
      api,
      allResourceTypes,
      `Twist DNA (${sample.dnaCode}, ${TWIST_DNA_CONCENTRATION} ng/µL)`,
      [
        { parameterTypeId: category.id, value: "material" },
        { parameterTypeId: materialType.id, value: "Twist DNA" },
        { parameterTypeId: dnaCodeParam.id, value: sample.dnaCode },
        {
          parameterTypeId: concentrationParam.id,
          value: TWIST_DNA_CONCENTRATION,
        },
      ],
      [wellCount.id],
    );

    const dilutedDna = await findOrCreateResourceType(
      api,
      allResourceTypes,
      `Diluted DNA (${sample.dnaCode}, ${DILUTED_DNA_CONCENTRATION} ng/µL)`,
      [
        { parameterTypeId: category.id, value: "material" },
        { parameterTypeId: materialType.id, value: "Diluted DNA" },
        { parameterTypeId: dnaCodeParam.id, value: sample.dnaCode },
        {
          parameterTypeId: concentrationParam.id,
          value: DILUTED_DNA_CONCENTRATION,
        },
      ],
      [wellCount.id],
    );

    const protein = await findOrCreateResourceType(
      api,
      allResourceTypes,
      `Protein (${sample.dnaCode}, ${sample.concentration} mg/mL)`,
      [
        { parameterTypeId: category.id, value: "material" },
        { parameterTypeId: materialType.id, value: "Protein" },
        { parameterTypeId: dnaCodeParam.id, value: sample.dnaCode },
        {
          parameterTypeId: concentrationParam.id,
          value: sample.concentration,
        },
      ],
      [wellCount.id],
    );

    // DNA Dilution mapping: Twist DNA → Diluted DNA
    dilutionMappings.push({
      inputs: [
        {
          resourceTypeId: twistDna.id,
          status: "review" as const,
          quantityParameters: [
            { parameterTypeId: wellCount.id, value: DEFAULT_WELL_COUNT },
          ],
        },
      ],
      outputs: [
        {
          resourceTypeId: dilutedDna.id,
          quantityParameters: [
            { parameterTypeId: wellCount.id, value: DEFAULT_WELL_COUNT },
          ],
        },
      ],
    });

    // Protein Expression mapping: Diluted DNA → Protein
    expressionMappings.push({
      inputs: [
        {
          resourceTypeId: dilutedDna.id,
          status: "review" as const,
          quantityParameters: [
            { parameterTypeId: wellCount.id, value: DEFAULT_WELL_COUNT },
          ],
        },
      ],
      outputs: [
        {
          resourceTypeId: protein.id,
          quantityParameters: [
            { parameterTypeId: wellCount.id, value: DEFAULT_WELL_COUNT },
          ],
        },
      ],
    });
  }

  // Create jobs
  const dilutionJob = await api.createJob({
    name: "DNA Dilution",
    notes: `Auto-generated by Protein Sample wizard. ${samples.length} sample(s).`,
    mappings: dilutionMappings,
    common: [
      {
        resourceTypeId: liquidHandler.id,
        quantityParameters: [
          { parameterTypeId: duration.id, value: LIQUID_HANDLER_DURATION },
        ],
      },
    ],
  });

  const expressionJob = await api.createJob({
    name: "Protein Expression",
    notes: `Auto-generated by Protein Sample wizard. ${samples.length} sample(s).`,
    mappings: expressionMappings,
    common: [
      {
        resourceTypeId: expressionMachine.id,
        quantityParameters: [
          { parameterTypeId: duration.id, value: EXPRESSION_DURATION },
          { parameterTypeId: temperature.id, value: EXPRESSION_TEMPERATURE },
        ],
      },
    ],
  });

  return {
    dilutionJobId: dilutionJob.id,
    expressionJobId: expressionJob.id,
  };
}
