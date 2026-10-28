using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Reporting.Application.Templates.Commands.UpdateReportTemplate;

public class UpdateReportTemplateCommandHandler : IRequestHandler<UpdateReportTemplateCommand>
{
    private readonly IReportingDbContext _db;

    public UpdateReportTemplateCommandHandler(IReportingDbContext db) => _db = db;

    public async Task Handle(UpdateReportTemplateCommand request, CancellationToken ct)
    {
        var template = await _db.ReportTemplates
            .FirstOrDefaultAsync(t => t.Id == request.TemplateId, ct)
            ?? throw new NotFoundException("ReportTemplate", request.TemplateId);

        template.Update(request.Name, request.Description, request.RequiredApprovalLevels, request.SubmissionDeadlineDays);
        await _db.SaveChangesAsync(ct);
    }
}
