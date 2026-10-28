using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SystemReports.Application.GeneratedReports.Commands.GenerateReport;
using NGO.PMS.SystemReports.Application.GeneratedReports.Commands.ShareReport;
using NGO.PMS.SystemReports.Application.GeneratedReports.Queries.GetGeneratedReports;
using NGO.PMS.SystemReports.Application.GeneratedReports.Queries.GetGeneratedReportById;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.SystemReports.API.Controllers;

[ApiController]
[Route("api/v1/generated-reports")]
[Authorize]
public class GeneratedReportsController : ControllerBase
{
    private readonly ISender _sender;
    public GeneratedReportsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("reports.generated.create")]
    public async Task<IActionResult> Generate(GenerateReportCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpGet]
    [RequirePermission("reports.generated.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? reportTemplateId,
        [FromQuery] DateTimeOffset? dateFrom,
        [FromQuery] DateTimeOffset? dateTo)
        => Ok(await _sender.Send(new GetGeneratedReportsQuery(reportTemplateId, dateFrom, dateTo)));

    [HttpGet("{id:guid}")]
    [RequirePermission("reports.generated.read")]
    public async Task<IActionResult> GetById(Guid id)
        => Ok(await _sender.Send(new GetGeneratedReportByIdQuery(id)));

    [HttpPost("{id:guid}/share")]
    [RequirePermission("reports.generated.create")]
    public async Task<IActionResult> Share(Guid id, ShareReportCommand command)
    {
        if (id != command.GeneratedReportId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
