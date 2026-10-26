using MediatR;

namespace NGO.PMS.ImportExport.Application.Commands.CancelImport;

public sealed record CancelImportCommand(Guid Id) : IRequest<Unit>;
