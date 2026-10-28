using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.Projects.Commands.CreateProject;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateProjectCommandHandler(IProjectsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken ct)
    {
        var codeExists = await _db.Projects
            .AnyAsync(p => p.Code == request.Code.Trim().ToUpperInvariant()
                        && p.OrganizationId == _currentUser.OrganizationId, ct);
        if (codeExists)
            throw new BusinessRuleException($"A project with code '{request.Code}' already exists.");

        var project = Project.Create(
            request.Code, request.Name, request.StartDate, request.EndDate,
            request.TotalBudget, request.CurrencyId, _currentUser.OrganizationId);

        if (request.Description is not null)
            project.Update(request.Name, request.Description, request.StartDate, request.EndDate,
                request.TotalBudget, request.DonorName, request.Sector, request.ProgramPillar);

        project.OfficeId = request.OfficeId;
        project.ProjectManagerId = request.ProjectManagerId;

        _db.Projects.Add(project);
        await _db.SaveChangesAsync(ct);
        return project.Id;
    }
}
