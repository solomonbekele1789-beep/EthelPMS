using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Partnerships.Application.Commands.CompleteComplianceCheck;
using NGO.PMS.Partnerships.Application.Commands.CreateComplianceCheck;
using NGO.PMS.Partnerships.Application.Commands.RequireComplianceFollowUp;
using NGO.PMS.Partnerships.Application.Queries.GetComplianceChecks;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Partnerships.API.Controllers;

[ApiController]
[Route("api/v1/partner-compliance")]
[Authorize]
public class PartnerComplianceController : ControllerBase
{
    private readonly ISender _sender;

    public PartnerComplianceController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("partnerships.compliance.create")]
    public async Task<IActionResult> Create(CreateComplianceCheckCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/partner-compliance/{id}", new { id });
    }

    [HttpGet]
    [RequirePermission("partnerships.compliance.read")]
    public async Task<IActionResult> List([FromQuery] Guid? subGranteeId)
        => Ok(await _sender.Send(new GetComplianceChecksQuery(subGranteeId)));

    [HttpPut("{id:guid}/complete")]
    [RequirePermission("partnerships.compliance.update")]
    public async Task<IActionResult> Complete(Guid id, CompleteComplianceCheckCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id:guid}/follow-up")]
    [RequirePermission("partnerships.compliance.update")]
    public async Task<IActionResult> RequireFollowUp(Guid id, RequireComplianceFollowUpCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
