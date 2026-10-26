using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Assets.Application.Commands.Assets.AssignAsset;
using NGO.PMS.Assets.Application.Commands.Assets.CalculateDepreciation;
using NGO.PMS.Assets.Application.Commands.Assets.RegisterAsset;
using NGO.PMS.Assets.Application.Commands.Assets.TransferAsset;
using NGO.PMS.Assets.Application.Commands.Assets.UpdateAsset;
using NGO.PMS.Assets.Application.Queries.GetAsset;
using NGO.PMS.Assets.Application.Queries.ListAssets;
using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Assets.API.Controllers;

[ApiController]
[Route("api/v1/assets")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly ISender _sender;
    public AssetsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("assets.register.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? categoryId,
        [FromQuery] AssetStatus? status,
        [FromQuery] Guid? projectId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListAssetsQuery(categoryId, status, projectId, search, page, pageSize)));

    [HttpGet("{id:guid}")]
    [RequirePermission("assets.register.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetAssetQuery(id)));

    [HttpPost]
    [RequirePermission("assets.register.create")]
    public async Task<IActionResult> Register(RegisterAssetCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("assets.register.update")]
    public async Task<IActionResult> Update(Guid id, UpdateAssetCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/transfers")]
    [RequirePermission("assets.transfers.create")]
    public async Task<IActionResult> Transfer(Guid id, TransferAssetCommand command)
    {
        if (id != command.AssetId) return BadRequest();
        var transferId = await _sender.Send(command);
        return Created($"api/v1/assets/{id}/transfers/{transferId}", new { id = transferId });
    }

    [HttpPost("{id:guid}/assignments")]
    [RequirePermission("assets.register.update")]
    public async Task<IActionResult> Assign(Guid id, AssignAssetCommand command)
    {
        if (id != command.AssetId) return BadRequest();
        var assignmentId = await _sender.Send(command);
        return Created($"api/v1/assets/{id}/assignments/{assignmentId}", new { id = assignmentId });
    }

    [HttpPost("{id:guid}/depreciation")]
    [RequirePermission("assets.register.update")]
    public async Task<IActionResult> CalculateDepreciation(Guid id, CalculateDepreciationCommand command)
    {
        if (id != command.AssetId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
