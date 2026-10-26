using MediatR;
using NGO.PMS.SystemReports.Application.DTOs;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Queries.GetGeneratedReportById;

public sealed record GetGeneratedReportByIdQuery(Guid Id) : IRequest<GeneratedReportDto>;
