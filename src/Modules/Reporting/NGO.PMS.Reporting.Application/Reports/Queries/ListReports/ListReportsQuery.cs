using MediatR;
using NGO.PMS.Reporting.Application.DTOs;
using NGO.PMS.Reporting.Domain.Enums;

namespace NGO.PMS.Reporting.Application.Reports.Queries.ListReports;

public sealed record ListReportsQuery(
    Guid? ProjectId,
    ReportType? ReportType,
    ReportStatus? Status,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ReportListItemDto>>;
