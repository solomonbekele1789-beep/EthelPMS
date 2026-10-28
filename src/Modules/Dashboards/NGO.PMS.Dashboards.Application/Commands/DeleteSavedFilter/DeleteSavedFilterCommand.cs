using MediatR;

namespace NGO.PMS.Dashboards.Application.Commands.DeleteSavedFilter;

public sealed record DeleteSavedFilterCommand(Guid Id) : IRequest<Unit>;
