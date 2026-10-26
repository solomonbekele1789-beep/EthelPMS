using MediatR;

namespace NGO.PMS.Projects.Application.Projects.Commands.UpdateProject;

public record UpdateProjectCommand(
    Guid ProjectId,
    string Name,
    string? Description,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    decimal TotalBudget,
    string? DonorName,
    string? Sector,
    string? ProgramPillar) : IRequest;
