using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Commands.ShareReport;

public class ShareReportCommandHandler : IRequestHandler<ShareReportCommand>
{
    private readonly ISystemReportsDbContext _db;

    public ShareReportCommandHandler(ISystemReportsDbContext db) => _db = db;

    public async Task Handle(ShareReportCommand request, CancellationToken ct)
    {
        var report = await _db.GeneratedReports
            .FirstOrDefaultAsync(r => r.Id == request.GeneratedReportId, ct)
            ?? throw new NotFoundException("GeneratedReport", request.GeneratedReportId);

        // TODO: Integrate with Notifications module to send report to recipients
    }
}
