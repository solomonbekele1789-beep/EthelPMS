using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.ImportExport.Application.Commands.TriggerDataSync;

public sealed class TriggerDataSyncCommandHandler : IRequestHandler<TriggerDataSyncCommand, Unit>
{
    private readonly IImportExportDbContext _db;

    public TriggerDataSyncCommandHandler(IImportExportDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(TriggerDataSyncCommand request, CancellationToken ct)
    {
        var config = await _db.DataSyncConfigs
            .FirstOrDefaultAsync(c => c.Id == request.DataSyncConfigId && c.IsActive, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.DataSyncConfig), request.DataSyncConfigId);

        config.RecordSync();
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
