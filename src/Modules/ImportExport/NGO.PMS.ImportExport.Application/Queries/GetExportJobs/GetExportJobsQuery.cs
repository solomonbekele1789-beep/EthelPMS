using MediatR;
using NGO.PMS.ImportExport.Application.DTOs;

namespace NGO.PMS.ImportExport.Application.Queries.GetExportJobs;

public sealed record GetExportJobsQuery(string? Module) : IRequest<List<ExportJobDto>>;
