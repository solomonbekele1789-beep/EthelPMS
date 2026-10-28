using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.KnowledgeMgmt.Application.Commands.CreateCategory;
using NGO.PMS.KnowledgeMgmt.Application.Commands.DeleteCategory;
using NGO.PMS.KnowledgeMgmt.Application.Commands.UpdateCategory;
using NGO.PMS.KnowledgeMgmt.Application.Queries.GetCategories;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.KnowledgeMgmt.API.Controllers;

[ApiController]
[Route("api/kb/categories")]
[Authorize]
public class KbCategoriesController : ControllerBase
{
    private readonly ISender _sender;

    public KbCategoriesController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("knowledge.categories.create")]
    public async Task<IActionResult> Create(CreateCategoryCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    [HttpGet]
    [RequirePermission("knowledge.categories.read")]
    public async Task<IActionResult> GetAll()
        => Ok(await _sender.Send(new GetCategoriesQuery()));

    [HttpPut("{id:guid}")]
    [RequirePermission("knowledge.categories.update")]
    public async Task<IActionResult> Update(Guid id, UpdateCategoryCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("knowledge.categories.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteCategoryCommand(id));
        return NoContent();
    }
}
