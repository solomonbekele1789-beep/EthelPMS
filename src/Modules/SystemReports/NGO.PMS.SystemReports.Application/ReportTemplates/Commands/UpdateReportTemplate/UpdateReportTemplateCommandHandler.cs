using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Commands.UpdateReportTemplate;

public class UpdateReportTemplateCommandHandler : IRequestHandler<UpdateReportTemplateCommand>
{
    private readonly ISystemReportsDbContext _db;

    public UpdateReportTemplateCommandHandler(ISystemReportsDbContext db) => _db = db;

    public async Task Handle(UpdateReportTemplateCommand request, CancellationToken ct)
    {
        var template = await _db.ReportTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id, ct)
            ?? throw new NotFoundException("ReportTemplate", request.Id);

        template.Update(request.Name, request.Description,
            request.QueryDefinition, request.TemplateContent, request.IsActive);
        await _db.SaveChangesAsync(ct);
    }
}
