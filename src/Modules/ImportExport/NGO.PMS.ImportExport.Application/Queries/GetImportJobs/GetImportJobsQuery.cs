using MediatR;
using NGO.PMS.ImportExport.Application.DTOs;
using NGO.PMS.ImportExport.Domain.Enums;

namespace NGO.PMS.ImportExport.Application.Queries.GetImportJobs;

public sealed record GetImportJobsQuery(string? Module, ImportJobStatus? Status) : IRequest<List<ImportJobListDto>>;
