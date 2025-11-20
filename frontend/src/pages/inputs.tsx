import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

// Individual slider card component with click-outside detection
function SliderCard({
  field,
  value,
  displayValue,
  isExpanded,
  onExpand,
  onCollapse,
  editingValue,
  onInputChange,
  onInputBlur,
  onSliderChange,
}: {
  field: any;
  value: number;
  displayValue: number;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  editingValue: string;
  onInputChange: (fieldId: string, value: string) => void;
  onInputBlur: (
    fieldId: string,
    min: number,
    max: number,
    logarithmic: boolean
  ) => void;
  onSliderChange: (fieldId: string, value: number[]) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onCollapse();
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, onCollapse]);

  return (
    <div
      ref={cardRef}
      className={`rounded-xl transition-all duration-300 ${
        isExpanded
          ? "bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-400 shadow-xl shadow-orange-200/50"
          : "bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-orange-300"
      }`}
    >
      {/* Collapsed View */}
      {!isExpanded && (
        <button
          onClick={onExpand}
          className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50/30 transition-all duration-200 rounded-xl"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-800 truncate">
              {field.label}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              Click to configure
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="px-3 py-1.5 bg-orange-100 rounded-lg">
              <span className="text-base font-bold text-orange-700 whitespace-nowrap">
                {displayValue.toLocaleString()} {field.unit}
              </span>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              className="text-gray-400 flex-shrink-0 transition-transform"
            >
              <path
                d="M7 9l3 3 3-3"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="p-7 space-y-5">
          <div className="flex justify-between items-center mb-2">
            <div>
              <Label
                htmlFor={field.id}
                className="text-base font-bold text-gray-800"
              >
                {field.label}
              </Label>
              <div className="text-xs text-gray-600 mt-1 font-medium">
                {field.min.toLocaleString()} - {field.max.toLocaleString()}{" "}
                {field.unit}
              </div>
            </div>
            <button
              onClick={onCollapse}
              className="text-gray-500 hover:text-orange-600 hover:bg-orange-100 p-2 rounded-lg transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-inner border border-orange-200">
            <div className="flex items-center gap-4 mb-4">
              <Input
                type="number"
                value={
                  editingValue !== undefined && editingValue !== ""
                    ? editingValue
                    : displayValue
                }
                onChange={(e) => onInputChange(field.id, e.target.value)}
                onBlur={() =>
                  onInputBlur(field.id, field.min, field.max, field.logarithmic)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                step={field.step}
                className="flex-1 text-center text-3xl font-black text-orange-600 border-2 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 h-16 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-700 min-w-[90px]">
                {field.unit}
              </span>
            </div>

            <Slider
              id={field.id}
              value={[value]}
              onValueChange={(val) => onSliderChange(field.id, val)}
              min={0}
              max={100}
              step={1}
              className="cursor-pointer my-6"
            />

            <div className="flex justify-between text-sm font-semibold text-gray-600 mt-2">
              <span className="bg-gray-100 px-3 py-1 rounded-md">
                {field.min.toLocaleString()}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-md">
                {field.max.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Inputs() {
  // Individual useState for each slider
  const [total_project_members, setTotalProjectMembers] = useState(50);
  const [total_project_stories, setTotalProjectStories] = useState(50);
  const [total_story_points, setTotalStoryPoints] = useState(50);
  const [number_of_low_priority_stories, setNumberOfLowPriorityStories] =
    useState(50);
  const [number_of_medium_priority_stories, setNumberOfMediumPriorityStories] =
    useState(50);
  const [number_of_high_priority_stories, setNumberOfHighPriorityStories] =
    useState(50);
  const [number_of_stories_in_progress, setNumberOfStoriesInProgress] =
    useState(50);
  const [number_of_stories_completed, setNumberOfStoriesCompleted] =
    useState(50);
  const [number_of_stories_todo, setNumberOfStoriesTodo] = useState(50);
  const [number_of_stories_in_review, setNumberOfStoriesInReview] =
    useState(50);
  const [number_of_different_teams, setNumberOfDifferentTeams] = useState(50);
  const [number_of_testing_stories, setNumberOfTestingStories] = useState(50);
  const [
    estimated_project_duration_in_days,
    setEstimatedProjectDurationInDays,
  ] = useState(50);
  const [number_of_epics, setNumberOfEpics] = useState(50);
  const [
    average_seniority_level_per_engineer_in_years,
    setAverageSeniorityLevelPerEngineerInYears,
  ] = useState(50);
  const [
    average_time_of_story_completion_in_hours,
    setAverageTimeOfStoryCompletionInHours,
  ] = useState(50);
  const [
    average_time_of_stories_in_progress_in_hours,
    setAverageTimeOfStoriesInProgressInHours,
  ] = useState(50);

  const [editingValues, setEditingValues] = useState<Record<string, string>>(
    {}
  );

  // Track which slider is currently expanded
  const [expandedSlider, setExpandedSlider] = useState<string | null>(null);

  // State setters map
  const stateSetters: Record<string, (value: number) => void> = {
    total_project_members: setTotalProjectMembers,
    total_project_stories: setTotalProjectStories,
    total_story_points: setTotalStoryPoints,
    number_of_low_priority_stories: setNumberOfLowPriorityStories,
    number_of_medium_priority_stories: setNumberOfMediumPriorityStories,
    number_of_high_priority_stories: setNumberOfHighPriorityStories,
    number_of_stories_in_progress: setNumberOfStoriesInProgress,
    number_of_stories_completed: setNumberOfStoriesCompleted,
    number_of_stories_todo: setNumberOfStoriesTodo,
    number_of_stories_in_review: setNumberOfStoriesInReview,
    number_of_different_teams: setNumberOfDifferentTeams,
    number_of_testing_stories: setNumberOfTestingStories,
    estimated_project_duration_in_days: setEstimatedProjectDurationInDays,
    number_of_epics: setNumberOfEpics,
    average_seniority_level_per_engineer_in_years:
      setAverageSeniorityLevelPerEngineerInYears,
    average_time_of_story_completion_in_hours:
      setAverageTimeOfStoryCompletionInHours,
    average_time_of_stories_in_progress_in_hours:
      setAverageTimeOfStoriesInProgressInHours,
  };

  // State values map
  const stateValues: Record<string, number> = {
    total_project_members,
    total_project_stories,
    total_story_points,
    number_of_low_priority_stories,
    number_of_medium_priority_stories,
    number_of_high_priority_stories,
    number_of_stories_in_progress,
    number_of_stories_completed,
    number_of_stories_todo,
    number_of_stories_in_review,
    number_of_different_teams,
    number_of_testing_stories,
    estimated_project_duration_in_days,
    number_of_epics,
    average_seniority_level_per_engineer_in_years,
    average_time_of_story_completion_in_hours,
    average_time_of_stories_in_progress_in_hours,
  };

  // Derived master object - automatically updates when any individual state changes
  const allFormData = {
    total_project_members,
    total_project_stories,
    total_story_points,
    number_of_low_priority_stories,
    number_of_medium_priority_stories,
    number_of_high_priority_stories,
    number_of_stories_in_progress,
    number_of_stories_completed,
    number_of_stories_todo,
    number_of_stories_in_review,
    number_of_different_teams,
    number_of_testing_stories,
    estimated_project_duration_in_days,
    number_of_epics,
    average_seniority_level_per_engineer_in_years,
    average_time_of_story_completion_in_hours,
    average_time_of_stories_in_progress_in_hours,
  };

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
    const newValue = value[0];

    // Update individual state (allFormData will auto-update as derived state)
    if (stateSetters[field]) {
      stateSetters[field](newValue);
    }

    // Clear editing value
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

        // Update individual state (allFormData will auto-update as derived state)
        if (stateSetters[field]) {
          stateSetters[field](sliderPosition);
        }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 shadow-xl">
        <div className="max-w-7xl mx-auto px-8 py-14">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="inline-block px-5 py-2 bg-white/25 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
                <span className="text-white text-sm font-bold tracking-wide">
                  🎯 Risk Assessment Platform
                </span>
              </div>
              <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
                Project Risk Calculator
              </h1>
              <p className="text-orange-100 text-lg max-w-xl font-medium">
                Configure your project parameters below to generate an accurate
                risk assessment and actionable insights
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 font-black px-14 py-8 text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 rounded-xl border-2 border-orange-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3"
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
        <Card className="shadow-2xl border-2 border-gray-200 bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-12">
            <div className="mb-10 pb-8 border-b-2 border-gray-200">
              <h2 className="text-3xl font-black text-gray-900 mb-3">
                Project Metrics
              </h2>
              <p className="text-gray-600 text-base font-medium">
                Configure your project parameters to calculate risk assessment
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 items-start">
              {sliderFields.map((field) => {
                const value = stateValues[field.id];
                const displayValue = field.logarithmic
                  ? logScale(value, field.min, field.max, field.step)
                  : linearScale(value, field.min, field.max, field.step);
                const isExpanded = expandedSlider === field.id;

                return (
                  <SliderCard
                    key={field.id}
                    field={field}
                    value={value}
                    displayValue={displayValue}
                    isExpanded={isExpanded}
                    onExpand={() => setExpandedSlider(field.id)}
                    onCollapse={() => setExpandedSlider(null)}
                    editingValue={editingValues[field.id]}
                    onInputChange={handleInputChange}
                    onInputBlur={handleInputBlur}
                    onSliderChange={handleSliderChange}
                  />
                );
              })}
            </div>

            {/* Calculate Risk Button */}
            <div className="mt-16 pt-10 border-t-2 border-gray-200">
              <div className="flex flex-col items-center gap-4">
                <p className="text-gray-600 font-medium text-center">
                  Ready to analyze your project?
                </p>
                <Button
                  size="lg"
                  onClick={() => {
                    console.log("All Form Data:", allFormData);
                    window.location.href = "/dashboard";
                  }}
                  className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white font-black px-24 py-8 text-2xl shadow-2xl hover:shadow-orange-300/50 hover:scale-105 transition-all duration-300 rounded-2xl border-2 border-orange-400"
                >
                  Calculate Risk Score
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-4"
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
