using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.DeleteActivity;

public class DeleteActivityCommandHandler : IRequestHandler<DeleteActivityCommand>
{
    private readonly IProjectsDbContext _db;

    public DeleteActivityCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(DeleteActivityCommand request, CancellationToken ct)
    {
        var activity = await _db.Activities
            .FirstOrDefaultAsync(a => a.Id == request.ActivityId, ct)
            ?? throw new NotFoundException("Activity", request.ActivityId);

        _db.Activities.Remove(activity);
        await _db.SaveChangesAsync(ct);
    }
}
