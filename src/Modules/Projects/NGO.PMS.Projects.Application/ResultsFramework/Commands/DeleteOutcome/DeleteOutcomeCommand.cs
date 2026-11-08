using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.DeleteOutcome;

public record DeleteOutcomeCommand(Guid OutcomeId) : IRequest;
