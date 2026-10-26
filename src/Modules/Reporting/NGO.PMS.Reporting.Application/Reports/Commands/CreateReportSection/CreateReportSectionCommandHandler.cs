using MediatR;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Application.Reports.Commands.CreateReportSection;

public class CreateReportSectionCommandHandler : IRequestHandler<CreateReportSectionCommand, Guid>
{
    private readonly IReportingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateReportSectionCommandHandler(IReportingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateReportSectionCommand request, CancellationToken ct)
    {
        var section = ReportSection.Create(
            request.ReportId,
            request.Title,
            request.SectionType,
            request.SortOrder,
            _currentUser.OrganizationId,
            request.TemplateSectionId,
            request.Content);

        _db.ReportSections.Add(section);
        await _db.SaveChangesAsync(ct);
        return section.Id;
    }
}
