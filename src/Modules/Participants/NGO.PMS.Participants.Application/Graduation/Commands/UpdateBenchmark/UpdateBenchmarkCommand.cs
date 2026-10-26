using MediatR;

namespace NGO.PMS.Participants.Application.Graduation.Commands.UpdateBenchmark;

public sealed record UpdateBenchmarkCommand(
    Guid BenchmarkId,
    string Name,
    string Domain,
    string? Description,
    decimal ThresholdP2,
    decimal ThresholdP3,
    decimal ThresholdP4,
    bool RequiredForGraduation,
    decimal Weight) : IRequest;
