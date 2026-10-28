using MediatR;

namespace NGO.PMS.ImportExport.Application.Commands.StartImport;

public sealed record StartImportCommand(
    Guid? ImportTemplateId,
    string FileName,
    long FileSize,
    string FileStoragePath,
    string Module,
    string EntityType) : IRequest<Guid>;
