"use client";

import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

export default function jobOpeningPage() {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={() => redirect("/job-openings/new-job-opening")}
        className="h-9 gap-1.5 rounded-full bg-dashboard-dark px-5 py-5 text-sm font-medium text-white shadow-xs hover:bg-dashboard-dark-hover"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>Nueva vacante</span>
      </Button>
    </div>
  );
}
