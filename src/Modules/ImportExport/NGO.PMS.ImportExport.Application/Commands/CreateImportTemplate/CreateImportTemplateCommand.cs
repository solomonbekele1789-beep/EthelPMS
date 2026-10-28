using MediatR;
using NGO.PMS.ImportExport.Domain.Enums;

namespace NGO.PMS.ImportExport.Application.Commands.CreateImportTemplate;

public sealed record CreateImportTemplateCommand(
    string Name,
    string Module,
    string EntityType,
    ImportFileFormat FileFormat,
    string ColumnMappings,
    string? ValidationRules,
    bool IsSystemTemplate) : IRequest<Guid>;
