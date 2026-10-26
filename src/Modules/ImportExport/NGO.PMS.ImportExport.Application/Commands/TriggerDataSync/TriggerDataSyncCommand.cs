using MediatR;

namespace NGO.PMS.ImportExport.Application.Commands.TriggerDataSync;

public sealed record TriggerDataSyncCommand(Guid DataSyncConfigId) : IRequest<Unit>;
