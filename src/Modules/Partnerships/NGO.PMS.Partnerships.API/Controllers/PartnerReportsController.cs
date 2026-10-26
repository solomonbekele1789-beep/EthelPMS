using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Partnerships.Application.Commands.CreatePartnerReport;
using NGO.PMS.Partnerships.Application.Commands.ReviewPartnerReport;
using NGO.PMS.Partnerships.Application.Commands.SubmitPartnerReport;
using NGO.PMS.Partnerships.Application.Queries.GetPartnerReportById;
using NGO.PMS.Partnerships.Application.Queries.GetPartnerReports;
using NGO.PMS.Partnerships.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Partnerships.API.Controllers;

[ApiController]
[Route("api/v1/partner-reports")]
[Authorize]
public class PartnerReportsController : ControllerBase
{
    private readonly ISender _sender;

    public PartnerReportsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("partnerships.reports.create")]
    public async Task<IActionResult> Create(CreatePartnerReportCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpGet]
    [RequirePermission("partnerships.reports.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? subGranteeId,
        [FromQuery] ReportStatus? status)
        => Ok(await _sender.Send(new GetPartnerReportsQuery(subGranteeId, status)));

    [HttpGet("{id:guid}")]
    [RequirePermission("partnerships.reports.read")]
    public async Task<IActionResult> GetById(Guid id)
        => Ok(await _sender.Send(new GetPartnerReportByIdQuery(id)));

    [HttpPut("{id:guid}/submit")]
    [RequirePermission("partnerships.reports.update")]
    public async Task<IActionResult> Submit(Guid id, SubmitPartnerReportCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id:guid}/review")]
    [RequirePermission("partnerships.reports.update")]
    public async Task<IActionResult> Review(Guid id, ReviewPartnerReportCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
