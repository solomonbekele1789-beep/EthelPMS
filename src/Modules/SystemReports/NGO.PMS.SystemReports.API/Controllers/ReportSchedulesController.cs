using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SystemReports.Application.ReportSchedules.Commands.CreateReportSchedule;
using NGO.PMS.SystemReports.Application.ReportSchedules.Commands.UpdateReportSchedule;
using NGO.PMS.SystemReports.Application.ReportSchedules.Commands.DeleteReportSchedule;
using NGO.PMS.SystemReports.Application.ReportSchedules.Queries.GetReportSchedules;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.SystemReports.API.Controllers;

[ApiController]
[Route("api/v1/report-schedules")]
[Authorize]
public class ReportSchedulesController : ControllerBase
{
    private readonly ISender _sender;
    public ReportSchedulesController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("reports.schedules.create")]
    public async Task<IActionResult> Create(CreateReportScheduleCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(List), new { id }, new { id });
    }

    [HttpGet]
    [RequirePermission("reports.schedules.read")]
    public async Task<IActionResult> List()
        => Ok(await _sender.Send(new GetReportSchedulesQuery()));

    [HttpPut("{id:guid}")]
    [RequirePermission("reports.schedules.update")]
    public async Task<IActionResult> Update(Guid id, UpdateReportScheduleCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("reports.schedules.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteReportScheduleCommand(id));
        return NoContent();
    }
}
