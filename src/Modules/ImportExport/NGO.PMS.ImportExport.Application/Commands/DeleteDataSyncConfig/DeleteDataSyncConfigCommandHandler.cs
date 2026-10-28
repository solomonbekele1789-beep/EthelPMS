using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.ImportExport.Application.Commands.DeleteDataSyncConfig;

public sealed class DeleteDataSyncConfigCommandHandler : IRequestHandler<DeleteDataSyncConfigCommand, Unit>
{
    private readonly IImportExportDbContext _db;

    public DeleteDataSyncConfigCommandHandler(IImportExportDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteDataSyncConfigCommand request, CancellationToken ct)
    {
        var config = await _db.DataSyncConfigs
            .FirstOrDefaultAsync(c => c.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.DataSyncConfig), request.Id);

        _db.DataSyncConfigs.Remove(config);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
