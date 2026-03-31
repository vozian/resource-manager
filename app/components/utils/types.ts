export type OmitEntityFields<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
