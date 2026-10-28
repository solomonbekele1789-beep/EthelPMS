using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.SystemReports.Application.ReportSchedules.Commands.DeleteReportSchedule;

public class DeleteReportScheduleCommandHandler : IRequestHandler<DeleteReportScheduleCommand>
{
    private readonly ISystemReportsDbContext _db;

    public DeleteReportScheduleCommandHandler(ISystemReportsDbContext db) => _db = db;

    public async Task Handle(DeleteReportScheduleCommand request, CancellationToken ct)
    {
        var schedule = await _db.ReportSchedules
            .FirstOrDefaultAsync(s => s.Id == request.Id, ct)
            ?? throw new NotFoundException("ReportSchedule", request.Id);

        _db.ReportSchedules.Remove(schedule);
        await _db.SaveChangesAsync(ct);
    }
}
