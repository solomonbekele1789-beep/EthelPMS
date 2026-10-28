using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateOutcome;

public class CreateOutcomeCommandHandler : IRequestHandler<CreateOutcomeCommand, Guid>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateOutcomeCommandHandler(IProjectsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateOutcomeCommand request, CancellationToken ct)
    {
        var projectExists = await _db.Projects
            .AnyAsync(p => p.Id == request.ProjectId, ct);
        if (!projectExists)
            throw new NotFoundException("Project", request.ProjectId);

        var outcome = Outcome.Create(
            request.Code, request.Description, request.ProjectId, _currentUser.OrganizationId);

        if (request.BaselineValue is not null || request.TargetValue is not null)
            outcome.Update(request.Description, request.BaselineValue, request.TargetValue, null);

        _db.Outcomes.Add(outcome);
        await _db.SaveChangesAsync(ct);
        return outcome.Id;
    }
}
