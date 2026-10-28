using MediatR;
using NGO.PMS.Training.Domain.Enums;

namespace NGO.PMS.Training.Application.Commands.UpdateTrainingProgram;

public sealed record UpdateTrainingProgramCommand(
    Guid ProgramId,
    string Title,
    TrainingCategory Category,
    int TotalSessions,
    string? Description) : IRequest<Guid>;
