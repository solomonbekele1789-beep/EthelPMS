using MediatR;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Application.Commands.StartImport;

public sealed class StartImportCommandHandler : IRequestHandler<StartImportCommand, Guid>
{
    private readonly IImportExportDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public StartImportCommandHandler(IImportExportDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(StartImportCommand request, CancellationToken ct)
    {
        var job = ImportJob.Create(
            _currentUser.OrganizationId,
            _currentUser.UserId,
            request.ImportTemplateId,
            request.FileName,
            request.FileSize,
            request.FileStoragePath,
            request.Module,
            request.EntityType);

        _db.ImportJobs.Add(job);
        await _db.SaveChangesAsync(ct);
        return job.Id;
    }
}
