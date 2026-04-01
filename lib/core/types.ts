export type EntityI = {
  id: string;
  createdAt: number;
  updatedAt: number;
};

export type ParameterTypeI = NamedEntityI & {
  valueType: ParameterValueTypeI;
};

export type ParameterI = {
  parameterTypeId: string;
  value: unknown;
};

export type NamedEntityI = EntityI & {
  name: string;
};

export type ParameterTypeSetI = ParameterTypeI[];
export type ParameterSetI = ParameterI[];

export type ResourceTypeI = NamedEntityI & {
  constraintParameters: ParameterSetI;
  quantityParameterTypeIds: string[];
};

export type ResourceQuantityI = {
  resourceTypeId: string;
  quantityParameters: ParameterSetI;
};

export type CheckedResourceQuantityI = ResourceQuantityI & {
  ready: boolean;
};

export enum ParameterValueTypeI {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export type ResourceMappingI = {
  input: ResourceQuantityI;
  output: ResourceQuantityI;
};

export type JobI = NamedEntityI & {
  mappings: ResourceMappingI[];
  common: ResourceQuantityI[];
};

export type ResourceContainerI = NamedEntityI & {
  id: string;
  parameters: ParameterSetI;
};

export type ResourceInstanceI = NamedEntityI & {
  resourceContainerId: string;
  availableFrom: number;
  // Exclusive - the resource is available until this time, but not at this time
  availableUntil: number;
  availableQuantity: ResourceQuantityI;
  reservedQuantity: ResourceQuantityI;
  // location: unknown; // TBD
};

export type JobTemplateI = Omit<JobI, "inputs" | "outputs">;

export type ExperimentI = NamedEntityI & {
  jobs: JobI[];
};

export type TaskI = NamedEntityI & {
  jobIds: string[];
};

// TBD
export type NoteI = {
  id: string;
  content: string;
};
