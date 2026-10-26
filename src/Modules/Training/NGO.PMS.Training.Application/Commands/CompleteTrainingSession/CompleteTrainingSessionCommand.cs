using MediatR;

namespace NGO.PMS.Training.Application.Commands.CompleteTrainingSession;

public sealed record CompleteTrainingSessionCommand(Guid SessionId) : IRequest<Guid>;
