using MediatR;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Application.Commands.CreateDataSyncConfig;

public sealed class CreateDataSyncConfigCommandHandler : IRequestHandler<CreateDataSyncConfigCommand, Guid>
{
    private readonly IImportExportDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateDataSyncConfigCommandHandler(IImportExportDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateDataSyncConfigCommand request, CancellationToken ct)
    {
        var config = DataSyncConfig.Create(
            _currentUser.OrganizationId,
            request.Name,
            request.SourceType,
            request.SourceUrl,
            request.ApiKey,
            request.FormId,
            request.TargetModule,
            request.TargetEntityType,
            request.MappingConfig,
            request.SyncFrequency);

        _db.DataSyncConfigs.Add(config);
        await _db.SaveChangesAsync(ct);
        return config.Id;
    }
}
