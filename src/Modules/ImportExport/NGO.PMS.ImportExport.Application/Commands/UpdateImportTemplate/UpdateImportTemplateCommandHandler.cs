using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.ImportExport.Application.Commands.UpdateImportTemplate;

public sealed class UpdateImportTemplateCommandHandler : IRequestHandler<UpdateImportTemplateCommand, Unit>
{
    private readonly IImportExportDbContext _db;

    public UpdateImportTemplateCommandHandler(IImportExportDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateImportTemplateCommand request, CancellationToken ct)
    {
        var template = await _db.ImportTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.ImportTemplate), request.Id);

        template.Update(request.Name, request.ColumnMappings, request.ValidationRules, request.IsActive);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
