using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Reporting.Application.Reports.Commands.ApproveReport;

public class ApproveReportCommandHandler : IRequestHandler<ApproveReportCommand>
{
    private readonly IReportingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApproveReportCommandHandler(IReportingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task Handle(ApproveReportCommand request, CancellationToken ct)
    {
        var report = await _db.Reports
            .Include(r => r.Approvals)
            .FirstOrDefaultAsync(r => r.Id == request.ReportId, ct)
            ?? throw new NotFoundException("Report", request.ReportId);

        report.Approve(_currentUser.UserId, request.ApprovalLevel, request.Comments);

        var latestApproval = report.Approvals.Last();
        _db.ReportApprovals.Add(latestApproval);

        await _db.SaveChangesAsync(ct);
    }
}
