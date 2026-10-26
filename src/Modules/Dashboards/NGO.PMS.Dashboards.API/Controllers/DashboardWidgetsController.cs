using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Dashboards.Application.Commands.AddWidget;
using NGO.PMS.Dashboards.Application.Commands.RemoveWidget;
using NGO.PMS.Dashboards.Application.Commands.UpdateWidget;
using NGO.PMS.Dashboards.Application.Queries.GetDashboardWidgets;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Dashboards.API.Controllers;

[ApiController]
[Route("api/v1/dashboards/{dashboardId:guid}/widgets")]
[Authorize]
public class DashboardWidgetsController : ControllerBase
{
    private readonly ISender _sender;

    public DashboardWidgetsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("dashboards.widgets.create")]
    public async Task<IActionResult> Add(Guid dashboardId, AddWidgetCommand command)
    {
        if (dashboardId != command.DashboardConfigId)
            return BadRequest("Route dashboardId does not match command DashboardConfigId.");

        var id = await _sender.Send(command);
        return Ok(new { id });
    }

    [HttpGet]
    [RequirePermission("dashboards.widgets.read")]
    public async Task<IActionResult> List(Guid dashboardId)
    {
        var result = await _sender.Send(new GetDashboardWidgetsQuery(dashboardId));
        return Ok(result);
    }

    [HttpPut("{widgetId:guid}")]
    [RequirePermission("dashboards.widgets.update")]
    public async Task<IActionResult> Update(Guid dashboardId, Guid widgetId, UpdateWidgetCommand command)
    {
        if (widgetId != command.Id)
            return BadRequest("Route widgetId does not match command Id.");

        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{widgetId:guid}")]
    [RequirePermission("dashboards.widgets.delete")]
    public async Task<IActionResult> Remove(Guid dashboardId, Guid widgetId)
    {
        await _sender.Send(new RemoveWidgetCommand(widgetId));
        return NoContent();
    }
}
