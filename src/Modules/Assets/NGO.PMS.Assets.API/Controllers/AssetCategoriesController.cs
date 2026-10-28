using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Assets.Application.Commands.AssetCategories.CreateAssetCategory;
using NGO.PMS.Assets.Application.Commands.AssetCategories.UpdateAssetCategory;
using NGO.PMS.Assets.Application.Queries.ListAssetCategories;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Assets.API.Controllers;

[ApiController]
[Route("api/v1/asset-categories")]
[Authorize]
public class AssetCategoriesController : ControllerBase
{
    private readonly ISender _sender;
    public AssetCategoriesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("assets.categories.read")]
    public async Task<IActionResult> List([FromQuery] string? search)
        => Ok(await _sender.Send(new ListAssetCategoriesQuery(search)));

    [HttpPost]
    [RequirePermission("assets.categories.create")]
    public async Task<IActionResult> Create(CreateAssetCategoryCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/asset-categories/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("assets.categories.update")]
    public async Task<IActionResult> Update(Guid id, UpdateAssetCategoryCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
