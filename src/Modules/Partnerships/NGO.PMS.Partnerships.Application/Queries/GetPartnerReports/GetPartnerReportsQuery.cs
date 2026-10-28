using MediatR;
using NGO.PMS.Partnerships.Application.DTOs;
using NGO.PMS.Partnerships.Domain.Enums;

namespace NGO.PMS.Partnerships.Application.Queries.GetPartnerReports;

public sealed record GetPartnerReportsQuery(Guid? SubGranteeId, ReportStatus? Status) : IRequest<List<PartnerReportListDto>>;
