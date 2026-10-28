using MediatR;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Application.Graduation.Commands.CreateBenchmark;

public class CreateBenchmarkCommandHandler : IRequestHandler<CreateBenchmarkCommand, Guid>
{
    private readonly IParticipantsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateBenchmarkCommandHandler(IParticipantsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateBenchmarkCommand request, CancellationToken ct)
    {
        var benchmark = GraduationBenchmark.Create(
            request.Name, request.Domain, _currentUser.OrganizationId,
            request.RequiredForGraduation, request.ProjectId, request.Description);

        _db.GraduationBenchmarks.Add(benchmark);
        await _db.SaveChangesAsync(ct);
        return benchmark.Id;
    }
}
