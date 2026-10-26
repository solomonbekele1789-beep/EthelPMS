using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.Projects.Commands.SubmitProject;

public class SubmitProjectCommandHandler : IRequestHandler<SubmitProjectCommand>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SubmitProjectCommandHandler(IProjectsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task Handle(SubmitProjectCommand request, CancellationToken ct)
    {
        var project = await _db.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, ct)
            ?? throw new NotFoundException("Project", request.ProjectId);

        project.Submit(_currentUser.UserId);
        await _db.SaveChangesAsync(ct);
    }
}
