using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SystemReports.Application.ReportTemplates.Commands.CreateReportTemplate;
using NGO.PMS.SystemReports.Application.ReportTemplates.Commands.UpdateReportTemplate;
using NGO.PMS.SystemReports.Application.ReportTemplates.Commands.DeleteReportTemplate;
using NGO.PMS.SystemReports.Application.ReportTemplates.Queries.GetReportTemplates;
using NGO.PMS.SystemReports.Application.ReportTemplates.Queries.GetReportTemplateById;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.SystemReports.API.Controllers;

[ApiController]
[Route("api/v1/system-report-templates")]
[Authorize]
public class ReportTemplatesController : ControllerBase
{
    private readonly ISender _sender;
    public ReportTemplatesController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("reports.templates.create")]
    public async Task<IActionResult> Create(CreateReportTemplateCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpGet]
    [RequirePermission("reports.templates.read")]
    public async Task<IActionResult> List([FromQuery] string? module)
        => Ok(await _sender.Send(new GetReportTemplatesQuery(module)));

    [HttpGet("{id:guid}")]
    [RequirePermission("reports.templates.read")]
    public async Task<IActionResult> GetById(Guid id)
        => Ok(await _sender.Send(new GetReportTemplateByIdQuery(id)));

    [HttpPut("{id:guid}")]
    [RequirePermission("reports.templates.update")]
    public async Task<IActionResult> Update(Guid id, UpdateReportTemplateCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("reports.templates.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteReportTemplateCommand(id));
        return NoContent();
    }
}
