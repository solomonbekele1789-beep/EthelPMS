using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.ImportExport.Application.Commands.CancelImport;

public sealed class CancelImportCommandHandler : IRequestHandler<CancelImportCommand, Unit>
{
    private readonly IImportExportDbContext _db;

    public CancelImportCommandHandler(IImportExportDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(CancelImportCommand request, CancellationToken ct)
    {
        var job = await _db.ImportJobs
            .FirstOrDefaultAsync(j => j.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.ImportJob), request.Id);

        job.Cancel();
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
