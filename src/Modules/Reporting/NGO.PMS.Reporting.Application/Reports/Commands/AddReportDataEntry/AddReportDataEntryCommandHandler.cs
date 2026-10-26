using MediatR;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Application.Reports.Commands.AddReportDataEntry;

public class AddReportDataEntryCommandHandler : IRequestHandler<AddReportDataEntryCommand, Guid>
{
    private readonly IReportingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddReportDataEntryCommandHandler(IReportingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(AddReportDataEntryCommand request, CancellationToken ct)
    {
        var entry = ReportDataEntry.Create(
            request.ReportSectionId,
            request.Key,
            _currentUser.OrganizationId,
            request.Label,
            request.StringValue,
            request.NumericValue,
            request.SortOrder,
            request.IndicatorId,
            request.ActivityId);

        _db.ReportDataEntries.Add(entry);
        await _db.SaveChangesAsync(ct);
        return entry.Id;
    }
}
