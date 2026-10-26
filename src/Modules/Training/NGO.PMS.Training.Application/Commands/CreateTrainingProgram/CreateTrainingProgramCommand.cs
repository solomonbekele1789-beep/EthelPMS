using MediatR;
using NGO.PMS.Training.Domain.Enums;

namespace NGO.PMS.Training.Application.Commands.CreateTrainingProgram;

public sealed record CreateTrainingProgramCommand(
    string Title,
    TrainingCategory Category,
    Guid ProjectId,
    int TotalSessions,
    string? Description) : IRequest<Guid>;
