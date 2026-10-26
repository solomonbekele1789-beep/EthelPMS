using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Partnerships.Application.Commands.ActivateSubGrantee;
using NGO.PMS.Partnerships.Application.Commands.AssessPartnerRisk;
using NGO.PMS.Partnerships.Application.Commands.RegisterSubGrantee;
using NGO.PMS.Partnerships.Application.Commands.SuspendSubGrantee;
using NGO.PMS.Partnerships.Application.Commands.UpdateSubGrantee;
using NGO.PMS.Partnerships.Application.Queries.GetSubGranteeById;
using NGO.PMS.Partnerships.Application.Queries.GetSubGrantees;
using NGO.PMS.Partnerships.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Partnerships.API.Controllers;

[ApiController]
[Route("api/v1/sub-grantees")]
[Authorize]
public class SubGranteesController : ControllerBase
{
    private readonly ISender _sender;

    public SubGranteesController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("partnerships.subgrantees.create")]
    public async Task<IActionResult> Register(RegisterSubGranteeCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpGet]
    [RequirePermission("partnerships.subgrantees.read")]
    public async Task<IActionResult> List(
        [FromQuery] PartnerStatus? status,
        [FromQuery] PartnerType? partnerType)
        => Ok(await _sender.Send(new GetSubGranteesQuery(status, partnerType)));

    [HttpGet("{id:guid}")]
    [RequirePermission("partnerships.subgrantees.read")]
    public async Task<IActionResult> GetById(Guid id)
        => Ok(await _sender.Send(new GetSubGranteeByIdQuery(id)));

    [HttpPut("{id:guid}")]
    [RequirePermission("partnerships.subgrantees.update")]
    public async Task<IActionResult> Update(Guid id, UpdateSubGranteeCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id:guid}/activate")]
    [RequirePermission("partnerships.subgrantees.update")]
    public async Task<IActionResult> Activate(Guid id)
    {
        await _sender.Send(new ActivateSubGranteeCommand(id));
        return NoContent();
    }

    [HttpPut("{id:guid}/suspend")]
    [RequirePermission("partnerships.subgrantees.update")]
    public async Task<IActionResult> Suspend(Guid id)
    {
        await _sender.Send(new SuspendSubGranteeCommand(id));
        return NoContent();
    }

    [HttpPut("{id:guid}/risk-assessment")]
    [RequirePermission("partnerships.subgrantees.update")]
    public async Task<IActionResult> AssessRisk(Guid id, AssessPartnerRiskCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
