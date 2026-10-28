using MediatR;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Application.Commands.CreateImportTemplate;

public sealed class CreateImportTemplateCommandHandler : IRequestHandler<CreateImportTemplateCommand, Guid>
{
    private readonly IImportExportDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateImportTemplateCommandHandler(IImportExportDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateImportTemplateCommand request, CancellationToken ct)
    {
        var template = ImportTemplate.Create(
            _currentUser.OrganizationId,
            request.Name,
            request.Module,
            request.EntityType,
            request.FileFormat,
            request.ColumnMappings,
            request.ValidationRules,
            request.IsSystemTemplate);

        _db.ImportTemplates.Add(template);
        await _db.SaveChangesAsync(ct);
        return template.Id;
    }
}
