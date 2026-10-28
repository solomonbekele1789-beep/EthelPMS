using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.SystemReports.Application.ReportSchedules.Commands.CreateReportSchedule;

public class CreateReportScheduleCommandHandler : IRequestHandler<CreateReportScheduleCommand, Guid>
{
    private readonly ISystemReportsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateReportScheduleCommandHandler(ISystemReportsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateReportScheduleCommand request, CancellationToken ct)
    {
        var templateExists = await _db.ReportTemplates
            .AnyAsync(t => t.Id == request.ReportTemplateId, ct);
        if (!templateExists)
            throw new NotFoundException("ReportTemplate", request.ReportTemplateId);

        var schedule = ReportSchedule.Create(
            request.ReportTemplateId, request.Name, request.CronExpression,
            request.Recipients, _currentUser.OrganizationId, request.Parameters);

        schedule.ComputeNextRun();
        _db.ReportSchedules.Add(schedule);
        await _db.SaveChangesAsync(ct);
        return schedule.Id;
    }
}
