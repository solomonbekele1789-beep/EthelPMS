using MediatR;

namespace NGO.PMS.Planning.Application.Dip.Commands.CreateDipMilestone;

public record CreateDipMilestoneCommand(
    Guid DipItemId,
    string Title,
    DateTimeOffset DueDate) : IRequest<Guid>;
