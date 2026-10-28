using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Domain.Abstractions;
using NGO.PMS.SystemReports.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Commands.GenerateReport;

public class GenerateReportCommandHandler : IRequestHandler<GenerateReportCommand, Guid>
{
    private readonly ISystemReportsDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IReportGenerator _reportGenerator;

    public GenerateReportCommandHandler(
        ISystemReportsDbContext db, ICurrentUserService currentUser, IReportGenerator reportGenerator)
    { _db = db; _currentUser = currentUser; _reportGenerator = reportGenerator; }

    public async Task<Guid> Handle(GenerateReportCommand request, CancellationToken ct)
    {
        var template = await _db.ReportTemplates
            .FirstOrDefaultAsync(t => t.Id == request.ReportTemplateId, ct)
            ?? throw new NotFoundException("ReportTemplate", request.ReportTemplateId);

        var bytes = await _reportGenerator.GenerateAsync(
            template.TemplateContent ?? string.Empty,
            template.QueryDefinition,
            request.Parameters ?? string.Empty,
            template.ReportFormat.ToString(),
            ct);

        var fileName = $"{template.Name}_{DateTimeOffset.UtcNow:yyyyMMdd_HHmmss}.{template.ReportFormat.ToString().ToLowerInvariant()}";
        var storagePath = $"reports/{_currentUser.OrganizationId}/{fileName}";

        var report = GeneratedReport.Create(
            template.Id, _currentUser.UserId, template.ReportFormat,
            fileName, bytes.Length, storagePath,
            _currentUser.OrganizationId);

        _db.GeneratedReports.Add(report);
        await _db.SaveChangesAsync(ct);
        return report.Id;
    }
}
