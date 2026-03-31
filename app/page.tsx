"use client";

import { useState } from "react";

import { ParameterTypeForm } from "./components/forms/ParameterTypeForm";
import { ParameterTypeI } from "@/lib/core/types";

export default function Home() {
  const [initialData, setInitialData] = useState<Partial<ParameterTypeI>>({});

  return (
    <div className="w-screen h-screen">
      {/* <ResourceTypeForm */}
      {/*   allParameters={[]} */}
      {/*   initialData={initialData} */}
      {/*   onSubmit={setInitialData} */}
      {/* /> */}
      <ParameterTypeForm onSubmit={setInitialData} />
    </div>
  );
}
