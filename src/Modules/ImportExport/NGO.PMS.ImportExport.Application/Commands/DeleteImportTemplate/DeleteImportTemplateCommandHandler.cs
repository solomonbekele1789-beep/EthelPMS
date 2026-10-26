using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.ImportExport.Application.Commands.DeleteImportTemplate;

public sealed class DeleteImportTemplateCommandHandler : IRequestHandler<DeleteImportTemplateCommand, Unit>
{
    private readonly IImportExportDbContext _db;

    public DeleteImportTemplateCommandHandler(IImportExportDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteImportTemplateCommand request, CancellationToken ct)
    {
        var template = await _db.ImportTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.ImportTemplate), request.Id);

        _db.ImportTemplates.Remove(template);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
