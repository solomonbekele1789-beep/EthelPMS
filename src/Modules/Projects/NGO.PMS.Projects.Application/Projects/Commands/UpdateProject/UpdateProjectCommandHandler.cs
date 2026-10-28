using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.Projects.Commands.UpdateProject;

public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand>
{
    private readonly IProjectsDbContext _db;

    public UpdateProjectCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(UpdateProjectCommand request, CancellationToken ct)
    {
        var project = await _db.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, ct)
            ?? throw new NotFoundException("Project", request.ProjectId);

        project.Update(request.Name, request.Description, request.StartDate, request.EndDate,
            request.TotalBudget, request.DonorName, request.Sector, request.ProgramPillar);

        await _db.SaveChangesAsync(ct);
    }
}
