using MediatR;
using NGO.PMS.ImportExport.Application.DTOs;

namespace NGO.PMS.ImportExport.Application.Queries.GetImportTemplates;

public sealed record GetImportTemplatesQuery(string? Module) : IRequest<List<ImportTemplateDto>>;
