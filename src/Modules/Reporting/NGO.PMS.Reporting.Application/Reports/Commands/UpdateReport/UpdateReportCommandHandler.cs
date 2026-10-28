using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Reporting.Application.Reports.Commands.UpdateReport;

public class UpdateReportCommandHandler : IRequestHandler<UpdateReportCommand>
{
    private readonly IReportingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateReportCommandHandler(IReportingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task Handle(UpdateReportCommand request, CancellationToken ct)
    {
        var report = await _db.Reports
            .FirstOrDefaultAsync(r => r.Id == request.ReportId, ct)
            ?? throw new NotFoundException("Report", request.ReportId);

        report.Update(
            request.Title,
            request.ExecutiveSummary,
            request.Challenges,
            request.LessonsLearned,
            request.Recommendations,
            request.PlannedBudget,
            request.ActualSpent,
            request.CumulativeYtdSpent,
            _currentUser.UserId);

        await _db.SaveChangesAsync(ct);
    }
}
