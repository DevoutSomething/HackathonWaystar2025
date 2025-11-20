export default function InputToInput(input) {
    // Calculate derived fields
    const averageMembersPerTeam = input.total_project_members / input.number_of_different_teams;
    const averageStoryPoints = input.total_story_points / input.total_project_stories;
    const averageStoryPointsPerEpic = input.total_story_points / input.number_of_epics;
    const averageStoryPointsPerEngineer = input.total_story_points / input.total_project_members;
    const averageSeniorityLevelInDays = input.average_seniority_level_per_engineer_in_years * 365;
    
    // Build the neural network input object
    return {
        total_project_members: input.total_project_members,
        average_members_per_team: averageMembersPerTeam,
        total_project_stories: input.total_project_stories,
        total_story_points: input.total_story_points,
        average_story_points: averageStoryPoints,
        number_of_low_priority_stories: input.number_of_low_priority_stories,
        number_of_medium_priority_stories: input.number_of_medium_priority_stories,
        number_of_high_priority_stories: input.number_of_high_priority_stories,
        number_of_stories_in_progress: input.number_of_stories_in_progress,
        number_of_stories_completed: input.number_of_stories_completed,
        number_of_stories_todo: input.number_of_stories_todo,
        number_of_stories_in_review: input.number_of_stories_in_review,
        number_of_different_teams: input.number_of_different_teams,
        number_of_testing_stories: input.number_of_testing_stories,
        estimated_project_duration_in_days: input.estimated_project_duration_in_days,
        number_of_epics: input.number_of_epics,
        average_story_points_per_epic: averageStoryPointsPerEpic,
        average_story_points_per_engineer: averageStoryPointsPerEngineer,
        average_seniority_level_per_engineer_in_days: averageSeniorityLevelInDays,
        average_time_of_story_completion_in_hours: input.average_time_of_story_completion_in_hours,
        average_time_of_stories_in_progress_in_hours: input.average_time_of_stories_in_progress_in_hours
    };
}
