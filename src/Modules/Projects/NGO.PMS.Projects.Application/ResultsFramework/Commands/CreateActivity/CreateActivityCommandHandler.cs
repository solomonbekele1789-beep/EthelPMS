using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateActivity;

public class CreateActivityCommandHandler : IRequestHandler<CreateActivityCommand, Guid>
{
    private readonly IProjectsDbContext _db;

    public CreateActivityCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateActivityCommand request, CancellationToken ct)
    {
        var output = await _db.Outputs
            .FirstOrDefaultAsync(o => o.Id == request.OutputId, ct)
            ?? throw new NotFoundException("Output", request.OutputId);

        var activity = Activity.Create(
            request.Code, request.Name, request.OutputId, output.OrganizationId);

        if (request.Description is not null || request.Unit is not null
            || request.LifetimeTarget is not null || request.BudgetAllocated is not null)
        {
            activity.Update(request.Name, request.Description, request.Unit,
                request.LifetimeTarget, request.BudgetAllocated, null, null, null);
        }

        _db.Activities.Add(activity);
        await _db.SaveChangesAsync(ct);
        return activity.Id;
    }
}
