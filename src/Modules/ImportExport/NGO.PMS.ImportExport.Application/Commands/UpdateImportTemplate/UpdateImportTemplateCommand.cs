using MediatR;

namespace NGO.PMS.ImportExport.Application.Commands.UpdateImportTemplate;

public sealed record UpdateImportTemplateCommand(
    Guid Id,
    string Name,
    string ColumnMappings,
    string? ValidationRules,
    bool IsActive) : IRequest<Unit>;
