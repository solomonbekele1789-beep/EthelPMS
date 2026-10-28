using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Dashboards.Application.Commands.CreateSavedFilter;
using NGO.PMS.Dashboards.Application.Commands.DeleteSavedFilter;
using NGO.PMS.Dashboards.Application.Queries.GetSavedFilters;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Dashboards.API.Controllers;

[ApiController]
[Route("api/v1/saved-filters")]
[Authorize]
public class SavedFiltersController : ControllerBase
{
    private readonly ISender _sender;

    public SavedFiltersController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("dashboards.filters.create")]
    public async Task<IActionResult> Create(CreateSavedFilterCommand command)
    {
        var id = await _sender.Send(command);
        return Ok(new { id });
    }

    [HttpGet]
    [RequirePermission("dashboards.filters.read")]
    public async Task<IActionResult> List([FromQuery] string? module)
    {
        var result = await _sender.Send(new GetSavedFiltersQuery(module));
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("dashboards.filters.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteSavedFilterCommand(id));
        return NoContent();
    }
}
