using MediatR;
using NGO.PMS.Reporting.Application.DTOs;

namespace NGO.PMS.Reporting.Application.Reports.Queries.GetFinancialSummary;

public sealed record GetFinancialSummaryQuery(Guid ProjectId, int? FiscalYear) : IRequest<FinancialSummaryDto>;
