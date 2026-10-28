using MediatR;

namespace NGO.PMS.Training.Application.Commands.CreateTrainer;

public sealed record CreateTrainerCommand(
    string FullName,
    bool IsInternal,
    string? Email,
    string? Phone,
    string? Specialization,
    string? Organization) : IRequest<Guid>;
