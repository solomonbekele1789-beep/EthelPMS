using MediatR;

namespace NGO.PMS.ImportExport.Application.Commands.UpdateDataSyncConfig;

public sealed record UpdateDataSyncConfigCommand(
    Guid Id,
    string Name,
    string SourceUrl,
    string? ApiKey,
    string MappingConfig,
    string? SyncFrequency,
    bool IsActive) : IRequest<Unit>;
