using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.ImportExport.Application.Commands.CreateDataSyncConfig;
using NGO.PMS.ImportExport.Application.Commands.DeleteDataSyncConfig;
using NGO.PMS.ImportExport.Application.Commands.TriggerDataSync;
using NGO.PMS.ImportExport.Application.Commands.UpdateDataSyncConfig;
using NGO.PMS.ImportExport.Application.Queries.GetDataSyncConfigs;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.ImportExport.API.Controllers;

[ApiController]
[Route("api/v1/data-sync")]
[Authorize]
public class DataSyncController : ControllerBase
{
    private readonly ISender _sender;

    public DataSyncController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("importexport.sync.create")]
    public async Task<IActionResult> Create(CreateDataSyncConfigCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/data-sync/{id}", new { id });
    }

    [HttpGet]
    [RequirePermission("importexport.sync.read")]
    public async Task<IActionResult> List()
        => Ok(await _sender.Send(new GetDataSyncConfigsQuery()));

    [HttpPut("{id:guid}")]
    [RequirePermission("importexport.sync.update")]
    public async Task<IActionResult> Update(Guid id, UpdateDataSyncConfigCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("importexport.sync.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteDataSyncConfigCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/trigger")]
    [RequirePermission("importexport.sync.update")]
    public async Task<IActionResult> Trigger(Guid id)
    {
        await _sender.Send(new TriggerDataSyncCommand(id));
        return Accepted();
    }
}
