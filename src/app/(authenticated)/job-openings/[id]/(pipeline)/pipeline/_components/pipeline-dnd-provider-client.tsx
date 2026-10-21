"use client";

import dynamic from "next/dynamic";

export const PipelineDndProviderClient = dynamic(
  () =>
    import("./pipeline-dnd-provider").then(
      (module) => module.PipelineDndProvider,
    ),
  {
    ssr: false,
  },
);
