using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.SubmitPartnerReport;

public sealed record SubmitPartnerReportCommand(
    Guid Id,
    string? Narrative,
    string? FinancialSummaryJson) : IRequest<Unit>;
