using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Commands.SubmitGrantReport;

public sealed class SubmitGrantReportCommandHandler : IRequestHandler<SubmitGrantReportCommand, Unit>
{
    private readonly IDonorsDbContext _db;

    public SubmitGrantReportCommandHandler(IDonorsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(SubmitGrantReportCommand request, CancellationToken ct)
    {
        var report = await _db.GrantReports.FirstOrDefaultAsync(r => r.Id == request.ReportId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.GrantReport), request.ReportId);

        report.Submit(request.FileUrl);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
