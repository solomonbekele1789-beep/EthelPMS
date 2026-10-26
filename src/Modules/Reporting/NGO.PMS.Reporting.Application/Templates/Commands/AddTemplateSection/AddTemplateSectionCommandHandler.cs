using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Reporting.Application.Templates.Commands.AddTemplateSection;

public class AddTemplateSectionCommandHandler : IRequestHandler<AddTemplateSectionCommand, Guid>
{
    private readonly IReportingDbContext _db;

    public AddTemplateSectionCommandHandler(IReportingDbContext db) => _db = db;

    public async Task<Guid> Handle(AddTemplateSectionCommand request, CancellationToken ct)
    {
        var template = await _db.ReportTemplates
            .Include(t => t.Sections)
            .FirstOrDefaultAsync(t => t.Id == request.ReportTemplateId, ct)
            ?? throw new NotFoundException("ReportTemplate", request.ReportTemplateId);

        var section = template.AddSection(
            request.Title,
            request.SectionType,
            request.SortOrder,
            request.IsRequired,
            request.Instructions);

        await _db.SaveChangesAsync(ct);
        return section.Id;
    }
}
