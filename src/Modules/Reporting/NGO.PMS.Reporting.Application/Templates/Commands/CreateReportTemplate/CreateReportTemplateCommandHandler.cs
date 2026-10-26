using MediatR;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Application.Templates.Commands.CreateReportTemplate;

public class CreateReportTemplateCommandHandler : IRequestHandler<CreateReportTemplateCommand, Guid>
{
    private readonly IReportingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateReportTemplateCommandHandler(IReportingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateReportTemplateCommand request, CancellationToken ct)
    {
        var template = ReportTemplate.Create(
            request.Name,
            request.ReportType,
            _currentUser.OrganizationId,
            request.RequiredApprovalLevels,
            request.SubmissionDeadlineDays,
            request.Description);

        _db.ReportTemplates.Add(template);
        await _db.SaveChangesAsync(ct);
        return template.Id;
    }
}
