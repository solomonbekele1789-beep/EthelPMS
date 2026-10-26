using MediatR;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Commands.CreateReportTemplate;

public class CreateReportTemplateCommandHandler : IRequestHandler<CreateReportTemplateCommand, Guid>
{
    private readonly ISystemReportsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateReportTemplateCommandHandler(ISystemReportsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateReportTemplateCommand request, CancellationToken ct)
    {
        var template = ReportTemplate.Create(
            request.Name, request.Module, request.ReportFormat,
            request.QueryDefinition, _currentUser.OrganizationId,
            request.Description, request.TemplateContent,
            request.IsSystemTemplate);

        _db.ReportTemplates.Add(template);
        await _db.SaveChangesAsync(ct);
        return template.Id;
    }
}
