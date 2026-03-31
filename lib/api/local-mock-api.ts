/* eslint-disable @typescript-eslint/no-explicit-any */
import { OmitEntityFields } from "@/app/components/utils/types";
import {
  JobI,
  ParameterTypeI,
  ParameterTypeSetI,
  ResourceTypeI,
} from "../core/types";

import { v4 as uuid } from "uuid";
import { seedMockData } from "./seedMockData";

let allItems: any[] = [];
const itemStorageKey = "items-v1";

function fetchAllItems() {
  const storedItems = localStorage.getItem(itemStorageKey);
  allItems = storedItems ? JSON.parse(storedItems) : [];
}

function saveAllItems() {
  localStorage.setItem(itemStorageKey, JSON.stringify(allItems));
}

export function enrichEntityFields<T>(entity: T) {
  return {
    id: uuid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...entity,
  };
}

async function getAllParameterTypes(): Promise<ParameterTypeSetI> {
  return allItems
    .filter((item) => item.type === "parameterType")
    .map((item) => item.data as ParameterTypeI);
}

async function getParameterTypeById(
  parameterTypeId: string,
): Promise<ParameterTypeI | undefined> {
  return allItems.find(
    (item) => item.type === "parameterType" && item.data.id === parameterTypeId,
  )?.data as ParameterTypeI | undefined;
}

async function createParameterType(
  parameterType: OmitEntityFields<ParameterTypeI>,
) {
  const enrichedParameterType = enrichEntityFields(parameterType);
  allItems.push({
    type: "parameterType",
    data: enrichedParameterType,
  });
  saveAllItems();
  return enrichedParameterType;
}

async function updateParameterType(
  parameterTypeId: string,
  parameterType: Partial<ParameterTypeI>,
) {
  const index = allItems.findIndex(
    (item) => item.type === "parameterType" && item.data.id === parameterTypeId,
  );
  if (index !== -1) {
    allItems[index].data = {
      ...allItems[index].data,
      ...parameterType,
      updatedAt: Date.now(),
    };
    saveAllItems();
  }
  return allItems[index]?.data as ParameterTypeI;
}

async function duplicateParameterType(parameterTypeId: string) {
  const original = await getParameterTypeById(parameterTypeId);
  if (!original) return undefined;
  const { id, createdAt, updatedAt, ...rest } = original;
  return createParameterType({ ...rest, name: `${rest.name} (copy)` });
}

async function deleteParameterType(parameterTypeId: string) {
  allItems = allItems.filter(
    (item) =>
      !(item.type === "parameterType" && item.data.id === parameterTypeId),
  );
  saveAllItems();
}

async function getAllResourceTypes(): Promise<ResourceTypeI[]> {
  return allItems
    .filter((item) => item.type === "resourceType")
    .map((item) => item.data as ResourceTypeI);
}

async function getResourceTypeById(
  resourceTypeId: string,
): Promise<ResourceTypeI | undefined> {
  return allItems.find(
    (item) => item.type === "resourceType" && item.data.id === resourceTypeId,
  )?.data as ResourceTypeI | undefined;
}

async function createResourceType(
  resourceType: OmitEntityFields<ResourceTypeI>,
) {
  const enrichedResourceType = enrichEntityFields(resourceType);
  allItems.push({
    type: "resourceType",
    data: enrichedResourceType,
  });
  saveAllItems();
  return enrichedResourceType;
}

async function updateResourceType(
  resourceTypeId: string,
  resourceType: Partial<ResourceTypeI>,
) {
  const index = allItems.findIndex(
    (item) => item.type === "resourceType" && item.data.id === resourceTypeId,
  );
  if (index !== -1) {
    allItems[index].data = {
      ...allItems[index].data,
      ...resourceType,
      updatedAt: Date.now(),
    };
    saveAllItems();
  }
  return allItems[index]?.data as ResourceTypeI;
}

async function duplicateResourceType(resourceTypeId: string) {
  const original = await getResourceTypeById(resourceTypeId);
  if (!original) return undefined;
  const { id, createdAt, updatedAt, ...rest } = original;
  return createResourceType({ ...rest, name: `${rest.name} (copy)` });
}

async function deleteResourceType(resourceTypeId: string) {
  allItems = allItems.filter(
    (item) =>
      !(item.type === "resourceType" && item.data.id === resourceTypeId),
  );
  saveAllItems();
}

async function getAllJobs(): Promise<JobI[]> {
  return allItems
    .filter((item) => item.type === "job")
    .map((item) => item.data as JobI);
}

async function getJobById(jobId: string): Promise<JobI | undefined> {
  return allItems.find((item) => item.type === "job" && item.data.id === jobId)
    ?.data as JobI | undefined;
}

async function createJob(job: OmitEntityFields<JobI>) {
  const enrichedJob = enrichEntityFields(job);
  allItems.push({
    type: "job",
    data: enrichedJob,
  });
  saveAllItems();
  return enrichedJob;
}

async function updateJob(jobId: string, job: Partial<JobI>) {
  const index = allItems.findIndex(
    (item) => item.type === "job" && item.data.id === jobId,
  );
  if (index !== -1) {
    allItems[index].data = {
      ...allItems[index].data,
      ...job,
      updatedAt: Date.now(),
    };
    saveAllItems();
  }
  return allItems[index]?.data as JobI;
}

async function duplicateJob(jobId: string) {
  const original = await getJobById(jobId);
  if (!original) return undefined;
  const { id, createdAt, updatedAt, ...rest } = original;
  return createJob({ ...rest, name: `${rest.name} (copy)` });
}

async function deleteJob(jobId: string) {
  allItems = allItems.filter(
    (item) => !(item.type === "job" && item.data.id === jobId),
  );
  saveAllItems();
}

export async function createApiClient() {
  fetchAllItems();
  if (allItems.length === 0) {
    allItems = seedMockData();
    saveAllItems();
  }

  return {
    getAllResourceTypes,
    getResourceTypeById,
    createResourceType,
    getAllParameterTypes,
    getParameterTypeById,
    createParameterType,
    updateParameterType,
    duplicateParameterType,
    deleteParameterType,
    updateResourceType,
    duplicateResourceType,
    deleteResourceType,
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    duplicateJob,
    deleteJob,
  };
}
