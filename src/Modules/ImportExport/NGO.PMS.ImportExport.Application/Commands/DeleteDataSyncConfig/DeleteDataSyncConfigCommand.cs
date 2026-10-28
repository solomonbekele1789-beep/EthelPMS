using MediatR;

namespace NGO.PMS.ImportExport.Application.Commands.DeleteDataSyncConfig;

public sealed record DeleteDataSyncConfigCommand(Guid Id) : IRequest<Unit>;
