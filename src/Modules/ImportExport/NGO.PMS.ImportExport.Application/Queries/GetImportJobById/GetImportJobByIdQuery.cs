using MediatR;
using NGO.PMS.ImportExport.Application.DTOs;

namespace NGO.PMS.ImportExport.Application.Queries.GetImportJobById;

public sealed record GetImportJobByIdQuery(Guid Id) : IRequest<ImportJobDto>;
