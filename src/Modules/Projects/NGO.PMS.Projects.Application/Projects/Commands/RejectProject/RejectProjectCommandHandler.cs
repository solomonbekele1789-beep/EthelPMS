using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.Projects.Commands.RejectProject;

public class RejectProjectCommandHandler : IRequestHandler<RejectProjectCommand>
{
    private readonly IProjectsDbContext _db;

    public RejectProjectCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(RejectProjectCommand request, CancellationToken ct)
    {
        var project = await _db.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, ct)
            ?? throw new NotFoundException("Project", request.ProjectId);

        project.Reject(request.Reason);
        await _db.SaveChangesAsync(ct);
    }
}
