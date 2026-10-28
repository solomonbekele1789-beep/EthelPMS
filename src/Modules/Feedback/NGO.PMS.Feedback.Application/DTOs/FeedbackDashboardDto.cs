namespace NGO.PMS.Feedback.Application.DTOs;

public class FeedbackDashboardDto
{
    public int TotalCount { get; set; }
    public int ResolvedCount { get; set; }
    public double AvgResolutionDays { get; set; }
    public int SlaBreachedCount { get; set; }
    public List<CategorySummaryDto> ByCategory { get; set; } = [];
    public List<StatusSummaryDto> ByStatus { get; set; } = [];
}

public class CategorySummaryDto
{
    public string CategoryName { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class StatusSummaryDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}
