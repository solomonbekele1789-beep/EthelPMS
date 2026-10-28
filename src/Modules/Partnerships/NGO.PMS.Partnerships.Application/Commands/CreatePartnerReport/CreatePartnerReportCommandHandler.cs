using MediatR;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Application.Commands.CreatePartnerReport;

public sealed class CreatePartnerReportCommandHandler : IRequestHandler<CreatePartnerReportCommand, Guid>
{
    private readonly IPartnershipsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePartnerReportCommandHandler(IPartnershipsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreatePartnerReportCommand request, CancellationToken ct)
    {
        var report = PartnerReport.Create(
            _currentUser.OrganizationId,
            request.SubGranteeId,
            request.ReportType,
            request.ReportingPeriodStart,
            request.ReportingPeriodEnd,
            request.Title);

        _db.PartnerReports.Add(report);
        await _db.SaveChangesAsync(ct);
        return report.Id;
    }
}
