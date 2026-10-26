using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Planning.Application.Config.Commands.UpdatePlanningConfig;
using NGO.PMS.Planning.Application.Config.Queries.GetPlanningConfig;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Planning.API.Controllers;

[ApiController]
[Route("api/v1/planning/config")]
[Authorize]
public class PlanningConfigController : ControllerBase
{
    private readonly ISender _sender;
    public PlanningConfigController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("planning.annual.read")]
    public async Task<IActionResult> Get()
        => Ok(await _sender.Send(new GetPlanningConfigQuery()));

    [HttpPut]
    [RequirePermission("planning.annual.update")]
    public async Task<IActionResult> Update(UpdatePlanningConfigCommand command)
    {
        await _sender.Send(command);
        return NoContent();
    }
}
