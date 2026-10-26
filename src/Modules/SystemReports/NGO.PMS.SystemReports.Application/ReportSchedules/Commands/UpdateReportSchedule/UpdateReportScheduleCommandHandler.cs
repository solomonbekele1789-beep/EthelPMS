using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.SystemReports.Application.ReportSchedules.Commands.UpdateReportSchedule;

public class UpdateReportScheduleCommandHandler : IRequestHandler<UpdateReportScheduleCommand>
{
    private readonly ISystemReportsDbContext _db;

    public UpdateReportScheduleCommandHandler(ISystemReportsDbContext db) => _db = db;

    public async Task Handle(UpdateReportScheduleCommand request, CancellationToken ct)
    {
        var schedule = await _db.ReportSchedules
            .FirstOrDefaultAsync(s => s.Id == request.Id, ct)
            ?? throw new NotFoundException("ReportSchedule", request.Id);

        schedule.Update(request.Name, request.CronExpression,
            request.Recipients, request.Parameters, request.IsActive);
        schedule.ComputeNextRun();
        await _db.SaveChangesAsync(ct);
    }
}
