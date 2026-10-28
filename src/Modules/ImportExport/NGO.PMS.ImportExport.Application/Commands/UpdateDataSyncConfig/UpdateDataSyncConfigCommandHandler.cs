using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.ImportExport.Application.Commands.UpdateDataSyncConfig;

public sealed class UpdateDataSyncConfigCommandHandler : IRequestHandler<UpdateDataSyncConfigCommand, Unit>
{
    private readonly IImportExportDbContext _db;

    public UpdateDataSyncConfigCommandHandler(IImportExportDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateDataSyncConfigCommand request, CancellationToken ct)
    {
        var config = await _db.DataSyncConfigs
            .FirstOrDefaultAsync(c => c.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.DataSyncConfig), request.Id);

        config.Update(request.Name, request.SourceUrl, request.ApiKey, request.MappingConfig, request.SyncFrequency, request.IsActive);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
