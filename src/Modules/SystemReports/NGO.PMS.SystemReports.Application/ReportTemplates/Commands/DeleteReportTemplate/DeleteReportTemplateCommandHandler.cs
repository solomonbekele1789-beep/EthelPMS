using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Commands.DeleteReportTemplate;

public class DeleteReportTemplateCommandHandler : IRequestHandler<DeleteReportTemplateCommand>
{
    private readonly ISystemReportsDbContext _db;

    public DeleteReportTemplateCommandHandler(ISystemReportsDbContext db) => _db = db;

    public async Task Handle(DeleteReportTemplateCommand request, CancellationToken ct)
    {
        var template = await _db.ReportTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id, ct)
            ?? throw new NotFoundException("ReportTemplate", request.Id);

        _db.ReportTemplates.Remove(template);
        await _db.SaveChangesAsync(ct);
    }
}
