using MediatR;

namespace NGO.PMS.Projects.Application.Projects.Commands.CreateProject;

public record CreateProjectCommand(
    string Code,
    string Name,
    string? Description,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    decimal TotalBudget,
    Guid CurrencyId,
    string? DonorName,
    string? Sector,
    string? ProgramPillar,
    Guid? OfficeId,
    Guid? ProjectManagerId) : IRequest<Guid>;
