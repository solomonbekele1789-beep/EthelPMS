using MediatR;

namespace NGO.PMS.Participants.Application.Graduation.Commands.CreateBenchmark;

public sealed record CreateBenchmarkCommand(
    string Name,
    string Domain,
    bool RequiredForGraduation,
    Guid? ProjectId,
    string? Description) : IRequest<Guid>;
