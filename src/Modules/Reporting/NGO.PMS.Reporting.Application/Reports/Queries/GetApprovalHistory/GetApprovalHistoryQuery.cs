using MediatR;
using NGO.PMS.Reporting.Application.DTOs;

namespace NGO.PMS.Reporting.Application.Reports.Queries.GetApprovalHistory;

public sealed record GetApprovalHistoryQuery(Guid ReportId) : IRequest<List<ReportApprovalDto>>;
