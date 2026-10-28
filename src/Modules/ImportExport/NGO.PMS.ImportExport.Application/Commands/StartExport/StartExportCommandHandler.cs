using MediatR;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Application.Commands.StartExport;

public sealed class StartExportCommandHandler : IRequestHandler<StartExportCommand, Guid>
{
    private readonly IImportExportDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public StartExportCommandHandler(IImportExportDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(StartExportCommand request, CancellationToken ct)
    {
        var job = ExportJob.Create(
            _currentUser.OrganizationId,
            _currentUser.UserId,
            request.Module,
            request.EntityType,
            request.ExportFormat,
            request.FilterCriteria);

        _db.ExportJobs.Add(job);
        await _db.SaveChangesAsync(ct);
        return job.Id;
    }
}
