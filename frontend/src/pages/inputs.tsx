import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

export default function Inputs() {
  const [formData, setFormData] = useState({
    total_project_members: 50,
    total_project_stories: 50,
    total_story_points: 50,
    number_of_low_priority_stories: 50,
    number_of_medium_priority_stories: 50,
    number_of_high_priority_stories: 50,
    number_of_stories_in_progress: 50,
    number_of_stories_completed: 50,
    number_of_stories_todo: 50,
    number_of_stories_in_review: 50,
    number_of_different_teams: 50,
    number_of_testing_stories: 50,
    estimated_project_duration_in_days: 50,
    number_of_epics: 50,
    average_seniority_level_per_engineer_in_years: 50,
    average_time_of_story_completion_in_hours: 50,
    average_time_of_stories_in_progress_in_hours: 50,
  });

  const [editingValues, setEditingValues] = useState<Record<string, string>>(
    {}
  );

  // Linear conversion functions with step rounding
  const linearScale = (
    value: number,
    min: number,
    max: number,
    step: number
  ) => {
    const rawValue = min + (max - min) * (value / 100);
    return Math.round(rawValue / step) * step;
  };

  const inverseLinearScale = (realValue: number, min: number, max: number) => {
    const clampedValue = Math.max(min, Math.min(max, realValue));
    return Math.round(((clampedValue - min) / (max - min)) * 100);
  };

  // Logarithmic conversion functions with step rounding
  const logScale = (value: number, min: number, max: number, step: number) => {
    const minLog = Math.log(min);
    const maxLog = Math.log(max);
    const scale = (maxLog - minLog) / 100;
    const rawValue = Math.exp(minLog + scale * value);
    return Math.round(rawValue / step) * step;
  };

  const inverseLogScale = (realValue: number, min: number, max: number) => {
    const clampedValue = Math.max(min, Math.min(max, realValue));
    const minLog = Math.log(min);
    const maxLog = Math.log(max);
    const scale = (maxLog - minLog) / 100;
    return Math.round((Math.log(clampedValue) - minLog) / scale);
  };

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [field]: value[0] }));
    setEditingValues((prev) => ({ ...prev, [field]: "" }));
  };

  const handleInputChange = (field: string, inputValue: string) => {
    setEditingValues((prev) => ({ ...prev, [field]: inputValue }));
  };

  const handleInputBlur = (
    field: string,
    min: number,
    max: number,
    logarithmic: boolean
  ) => {
    const inputValue = editingValues[field];
    if (inputValue) {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        const sliderPosition = logarithmic
          ? inverseLogScale(numValue, min, max)
          : inverseLinearScale(numValue, min, max);
        setFormData((prev) => ({ ...prev, [field]: sliderPosition }));
      }
    }
    setEditingValues((prev) => ({ ...prev, [field]: "" }));
  };

  const sliderFields = [
    {
      id: "total_project_members",
      label: "Total Project Members",
      min: 1,
      max: 100,
      unit: "people",
      logarithmic: false,
      step: 1,
    },
    {
      id: "total_project_stories",
      label: "Total Project Stories",
      min: 1,
      max: 500,
      unit: "stories",
      logarithmic: true,
      step: 1,
    },
    {
      id: "total_story_points",
      label: "Total Story Points",
      min: 1,
      max: 5000,
      unit: "points",
      logarithmic: true,
      step: 10,
    },
    {
      id: "number_of_low_priority_stories",
      label: "Low Priority Stories",
      min: 0,
      max: 200,
      unit: "stories",
      logarithmic: false,
      step: 1,
    },
    {
      id: "number_of_medium_priority_stories",
      label: "Medium Priority Stories",
      min: 0,
      max: 200,
      unit: "stories",
      logarithmic: false,
      step: 1,
    },
    {
      id: "number_of_high_priority_stories",
      label: "High Priority Stories",
      min: 0,
      max: 200,
      unit: "stories",
      logarithmic: false,
      step: 1,
    },
    {
      id: "number_of_stories_in_progress",
      label: "Stories In Progress",
      min: 0,
      max: 100,
      unit: "stories",
      logarithmic: false,
      step: 1,
    },
    {
      id: "number_of_stories_completed",
      label: "Stories Completed",
      min: 0,
      max: 500,
      unit: "stories",
      logarithmic: false,
      step: 1,
    },
    {
      id: "number_of_stories_todo",
      label: "Stories To Do",
      min: 0,
      max: 500,
      unit: "stories",
      logarithmic: false,
      step: 1,
    },
    {
      id: "number_of_stories_in_review",
      label: "Stories In Review",
      min: 0,
      max: 100,
      unit: "stories",
      logarithmic: false,
      step: 1,
    },
    {
      id: "number_of_different_teams",
      label: "Number of Teams",
      min: 1,
      max: 20,
      unit: "teams",
      logarithmic: false,
      step: 1,
    },
    {
      id: "number_of_testing_stories",
      label: "Testing Stories",
      min: 0,
      max: 100,
      unit: "stories",
      logarithmic: false,
      step: 1,
    },
    {
      id: "estimated_project_duration_in_days",
      label: "Estimated Project Duration",
      min: 1,
      max: 365,
      unit: "days",
      logarithmic: false,
      step: 1,
    },
    {
      id: "number_of_epics",
      label: "Number of Epics",
      min: 1,
      max: 50,
      unit: "epics",
      logarithmic: false,
      step: 1,
    },
    {
      id: "average_seniority_level_per_engineer_in_years",
      label: "Avg Engineer Seniority",
      min: 0,
      max: 20,
      unit: "years",
      logarithmic: false,
      step: 0.5,
    },
    {
      id: "average_time_of_story_completion_in_hours",
      label: "Avg Story Completion Time",
      min: 1,
      max: 200,
      unit: "hours",
      logarithmic: false,
      step: 1,
    },
    {
      id: "average_time_of_stories_in_progress_in_hours",
      label: "Avg Story In Progress Time",
      min: 1,
      max: 500,
      unit: "hours",
      logarithmic: false,
      step: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-white text-sm font-medium">
                  Risk Assessment Platform
                </span>
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                Project Risk Calculator
              </h1>
              <p className="text-orange-50 text-lg max-w-xl">
                Adjust the parameters below to analyze your project's risk
                profile and get actionable insights
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              Link with Jira
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <Card className="shadow-2xl border border-gray-200 bg-white">
          <CardContent className="p-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Project Metrics
              </h2>
              <p className="text-gray-600">
                Configure your project parameters to calculate risk assessment
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {sliderFields.map((field) => {
                const value = formData[field.id as keyof typeof formData];
                const displayValue = field.logarithmic
                  ? logScale(value, field.min, field.max, field.step)
                  : linearScale(value, field.min, field.max, field.step);

                return (
                  <div key={field.id} className="space-y-3">
                    <div className="flex justify-between items-center gap-4">
                      <Label
                        htmlFor={field.id}
                        className="text-sm font-semibold text-gray-700"
                      >
                        {field.label}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={
                            editingValues[field.id] !== undefined &&
                            editingValues[field.id] !== ""
                              ? editingValues[field.id]
                              : displayValue
                          }
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          onBlur={() =>
                            handleInputBlur(
                              field.id,
                              field.min,
                              field.max,
                              field.logarithmic
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                          step={field.step}
                          className="w-28 text-right font-bold text-orange-600 border-2 border-gray-200 focus:border-orange-500 h-9"
                        />
                        <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                          {field.unit}
                        </span>
                      </div>
                    </div>
                    <Slider
                      id={field.id}
                      value={[value]}
                      onValueChange={(val) => handleSliderChange(field.id, val)}
                      min={0}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{field.min.toLocaleString()}</span>
                      <span>{field.max.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculate Risk Button */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-20 py-7 text-xl shadow-2xl hover:shadow-3xl transition-all rounded-xl"
                >
                  Calculate Risk Score
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-3"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
