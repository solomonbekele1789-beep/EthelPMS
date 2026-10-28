using MediatR;

namespace NGO.PMS.Reporting.Application.Reports.Commands.UpdateReport;

public sealed record UpdateReportCommand(
    Guid ReportId,
    string Title,
    string? ExecutiveSummary,
    string? Challenges,
    string? LessonsLearned,
    string? Recommendations,
    decimal PlannedBudget,
    decimal ActualSpent,
    decimal? CumulativeYtdSpent) : IRequest;
