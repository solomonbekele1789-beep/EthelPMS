using MediatR;
using NGO.PMS.ImportExport.Domain.Enums;

namespace NGO.PMS.ImportExport.Application.Commands.CreateDataSyncConfig;

public sealed record CreateDataSyncConfigCommand(
    string Name,
    DataSourceType SourceType,
    string SourceUrl,
    string? ApiKey,
    string? FormId,
    string TargetModule,
    string TargetEntityType,
    string MappingConfig,
    string? SyncFrequency) : IRequest<Guid>;
