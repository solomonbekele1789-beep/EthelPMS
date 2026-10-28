using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Donors.Application.Commands.ActivateGrant;
using NGO.PMS.Donors.Application.Commands.AddGrantCondition;
using NGO.PMS.Donors.Application.Commands.CreateGrant;
using NGO.PMS.Donors.Application.Commands.MarkConditionMet;
using NGO.PMS.Donors.Application.Commands.SubmitGrantReport;
using NGO.PMS.Donors.Application.Queries.GetComplianceDashboard;
using NGO.PMS.Donors.Application.Queries.GetGrant;
using NGO.PMS.Donors.Application.Queries.ListGrants;
using NGO.PMS.Donors.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Donors.API.Controllers;

[ApiController]
[Route("api/v1/grants")]
[Authorize]
public class GrantsController : ControllerBase
{
    private readonly ISender _sender;

    public GrantsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("donors.grants.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? donorId,
        [FromQuery] GrantStatus? status,
        [FromQuery] Guid? projectId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListGrantsQuery(donorId, status, projectId, page, pageSize)));

    [HttpGet("{id:guid}")]
    [RequirePermission("donors.grants.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetGrantQuery(id)));

    [HttpPost]
    [RequirePermission("donors.grants.create")]
    public async Task<IActionResult> Create(CreateGrantCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}/activate")]
    [RequirePermission("donors.grants.update")]
    public async Task<IActionResult> Activate(Guid id)
    {
        await _sender.Send(new ActivateGrantCommand(id));
        return NoContent();
    }

    [HttpPost("{grantId:guid}/conditions")]
    [RequirePermission("donors.grants.update")]
    public async Task<IActionResult> AddCondition(Guid grantId, AddGrantConditionCommand command)
    {
        if (grantId != command.GrantId) return BadRequest();
        var id = await _sender.Send(command);
        return Created($"api/v1/grants/{grantId}/conditions/{id}", new { id });
    }

    [HttpPut("conditions/{conditionId:guid}/mark-met")]
    [RequirePermission("donors.grants.update")]
    public async Task<IActionResult> MarkConditionMet(Guid conditionId, MarkConditionMetCommand command)
    {
        if (conditionId != command.ConditionId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("reports/{reportId:guid}/submit")]
    [RequirePermission("donors.grants.update")]
    public async Task<IActionResult> SubmitReport(Guid reportId, SubmitGrantReportCommand command)
    {
        if (reportId != command.ReportId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpGet("compliance-dashboard")]
    [RequirePermission("donors.grants.read")]
    public async Task<IActionResult> GetComplianceDashboard()
        => Ok(await _sender.Send(new GetComplianceDashboardQuery()));
}
