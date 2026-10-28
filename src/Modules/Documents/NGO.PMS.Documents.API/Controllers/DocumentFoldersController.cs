using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Documents.Application.Commands.Folders.CreateFolder;
using NGO.PMS.Documents.Application.Commands.Folders.MoveFolder;
using NGO.PMS.Documents.Application.Commands.Folders.UpdateFolder;
using NGO.PMS.Documents.Application.Queries.GetFolderTree;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Documents.API.Controllers;

[ApiController]
[Route("api/v1/document-folders")]
[Authorize]
public class DocumentFoldersController : ControllerBase
{
    private readonly ISender _sender;

    public DocumentFoldersController(ISender sender) => _sender = sender;

    [HttpGet("tree")]
    [RequirePermission("documents.folders.read")]
    public async Task<IActionResult> GetTree([FromQuery] Guid? projectId)
    {
        var result = await _sender.Send(new GetFolderTreeQuery(projectId));
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("documents.folders.create")]
    public async Task<IActionResult> Create(CreateFolderCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(GetTree), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("documents.folders.update")]
    public async Task<IActionResult> Update(Guid id, UpdateFolderCommand command)
    {
        if (id != command.FolderId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPatch("{id:guid}/move")]
    [RequirePermission("documents.folders.update")]
    public async Task<IActionResult> Move(Guid id, MoveFolderCommand command)
    {
        if (id != command.FolderId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
