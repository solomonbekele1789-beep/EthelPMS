using MediatR;

namespace NGO.PMS.Dashboards.Application.Commands.CreateSavedFilter;

public sealed record CreateSavedFilterCommand(
    string Name,
    string Module,
    string? FilterJson,
    bool IsDefault) : IRequest<Guid>;
