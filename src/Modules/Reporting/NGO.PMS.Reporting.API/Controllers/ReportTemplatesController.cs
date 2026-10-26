using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Reporting.Application.Templates.Commands.AddTemplateSection;
using NGO.PMS.Reporting.Application.Templates.Commands.CreateReportTemplate;
using NGO.PMS.Reporting.Application.Templates.Commands.UpdateReportTemplate;
using NGO.PMS.Reporting.Application.Templates.Queries.ListReportTemplates;
using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Reporting.API.Controllers;

[ApiController]
[Route("api/v1/report-templates")]
[Authorize]
public class ReportTemplatesController : ControllerBase
{
    private readonly ISender _sender;
    public ReportTemplatesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("reporting.reports.read")]
    public async Task<IActionResult> List([FromQuery] ReportType? reportType)
        => Ok(await _sender.Send(new ListReportTemplatesQuery(reportType)));

    [HttpPost]
    [RequirePermission("reporting.reports.create")]
    public async Task<IActionResult> Create(CreateReportTemplateCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/report-templates/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("reporting.reports.update")]
    public async Task<IActionResult> Update(Guid id, UpdateReportTemplateCommand command)
    {
        if (id != command.TemplateId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/sections")]
    [RequirePermission("reporting.reports.update")]
    public async Task<IActionResult> AddSection(Guid id, AddTemplateSectionCommand command)
    {
        if (id != command.ReportTemplateId) return BadRequest();
        var sectionId = await _sender.Send(command);
        return Created($"api/v1/report-templates/{id}/sections/{sectionId}", new { id = sectionId });
    }
}
