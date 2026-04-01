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

export type StatusResourceQuantityI = ResourceQuantityI & {
  status: "ready" | "unavailable" | "canceled" | "review";
};

export enum ParameterValueTypeI {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export type ResourceMappingI = {
  inputs: StatusResourceQuantityI[];
  outputs: ResourceQuantityI[];
};

export type JobI = NamedEntityI & {
  notes: string;
  mappings: ResourceMappingI[];
  common: ResourceQuantityI[];
};
