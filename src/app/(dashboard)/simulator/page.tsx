"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SimulationPanel } from "@/components/simulator/simulation-panel";
import { useStore } from "@/store";
import { ArrowLeft, Calendar } from "lucide-react";

export default function SimulatorPage() {
  const router = useRouter();
  const { dateRange } = useStore();

  const formatDateRange = () => {
    if (!dateRange) return "Date range not selected";
    const start = dateRange.startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const end = dateRange.endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Revenue Impact Simulator
            </h1>
            <p className="text-gray-600">
              Adjust metrics to see the potential revenue impact
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDateRange()}</span>
          </div>
        </div>
      </div>

      <SimulationPanel />

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push("/compare")}>
          View Saved Scenarios
        </Button>
      </div>
    </div>
  );
}
