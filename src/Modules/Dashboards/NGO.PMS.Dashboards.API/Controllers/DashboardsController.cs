using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Dashboards.Application.Commands.CreateDashboard;
using NGO.PMS.Dashboards.Application.Commands.DeleteDashboard;
using NGO.PMS.Dashboards.Application.Commands.UpdateDashboard;
using NGO.PMS.Dashboards.Application.Queries.GetDashboardById;
using NGO.PMS.Dashboards.Application.Queries.GetDashboards;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Dashboards.API.Controllers;

[ApiController]
[Route("api/v1/dashboards")]
[Authorize]
public class DashboardsController : ControllerBase
{
    private readonly ISender _sender;

    public DashboardsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("dashboards.configs.create")]
    public async Task<IActionResult> Create(CreateDashboardCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpGet]
    [RequirePermission("dashboards.configs.read")]
    public async Task<IActionResult> List()
    {
        var result = await _sender.Send(new GetDashboardsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("dashboards.configs.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _sender.Send(new GetDashboardByIdQuery(id));
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("dashboards.configs.update")]
    public async Task<IActionResult> Update(Guid id, UpdateDashboardCommand command)
    {
        if (id != command.Id)
            return BadRequest("Route id does not match command Id.");

        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("dashboards.configs.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteDashboardCommand(id));
        return NoContent();
    }
}
