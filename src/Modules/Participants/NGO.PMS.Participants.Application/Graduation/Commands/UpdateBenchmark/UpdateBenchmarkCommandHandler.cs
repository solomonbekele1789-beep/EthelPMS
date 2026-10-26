using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Participants.Application.Graduation.Commands.UpdateBenchmark;

public class UpdateBenchmarkCommandHandler : IRequestHandler<UpdateBenchmarkCommand>
{
    private readonly IParticipantsDbContext _db;

    public UpdateBenchmarkCommandHandler(IParticipantsDbContext db) => _db = db;

    public async Task Handle(UpdateBenchmarkCommand request, CancellationToken ct)
    {
        var benchmark = await _db.GraduationBenchmarks
            .FirstOrDefaultAsync(b => b.Id == request.BenchmarkId, ct)
            ?? throw new NotFoundException("GraduationBenchmark", request.BenchmarkId);

        benchmark.Update(request.Name, request.Domain, request.Description,
            request.ThresholdP2, request.ThresholdP3, request.ThresholdP4,
            request.RequiredForGraduation, request.Weight);

        await _db.SaveChangesAsync(ct);
    }
}
