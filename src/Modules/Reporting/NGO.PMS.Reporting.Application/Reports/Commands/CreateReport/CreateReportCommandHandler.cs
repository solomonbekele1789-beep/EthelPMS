using MediatR;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Application.Reports.Commands.CreateReport;

public class CreateReportCommandHandler : IRequestHandler<CreateReportCommand, Guid>
{
    private readonly IReportingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateReportCommandHandler(IReportingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateReportCommand request, CancellationToken ct)
    {
        var report = Report.Create(
            request.Title,
            request.ReportType,
            request.ProjectId,
            request.PeriodStart,
            request.PeriodEnd,
            _currentUser.OrganizationId,
            request.ReportTemplateId);

        report.SetPeriodDesignators(
            request.FiscalYear,
            request.Quarter,
            request.Month,
            request.WeekNumber);

        report.UpdateFinancials(request.PlannedBudget, 0, null);

        _db.Reports.Add(report);
        await _db.SaveChangesAsync(ct);
        return report.Id;
    }
}
