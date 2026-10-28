using MediatR;
using NGO.PMS.ImportExport.Application.DTOs;

namespace NGO.PMS.ImportExport.Application.Queries.GetImportTemplateById;

public sealed record GetImportTemplateByIdQuery(Guid Id) : IRequest<ImportTemplateDto>;
