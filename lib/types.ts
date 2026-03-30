export type ResourceTypeI = {
  id: string;
  name: string;
};

export type ParameterTypeI = {
  id: string;
  name: string;
};

export type JobTypeI = {
  id: string;
  name: string;
};

export type JobI = {
  id: string;
  jobTypeId: string;
  name: string;
  dependsOnJobIds: string[];
  parameters: ParameterI[];
  instructions: string;
};

export type ParameterI = {
  parameterTypeId: string;
  value: unknown;
};

export type JobOrderI = {
  id: string;
  name: string;
  jobs: JobI[];
  instructions: string;
};

export type TaskI = {
  id: string;
  name: string;
  jobIds: string[];
  instructions: string;
};
