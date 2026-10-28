using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Documents.Application.Commands.Documents.AddDocumentComment;
using NGO.PMS.Documents.Application.Commands.Documents.UpdateDocumentMetadata;
using NGO.PMS.Documents.Application.Commands.Documents.UploadDocument;
using NGO.PMS.Documents.Application.Commands.Documents.UploadNewVersion;
using NGO.PMS.Documents.Application.Queries.GetDocument;
using NGO.PMS.Documents.Application.Queries.ListDocuments;
using NGO.PMS.Documents.Application.Queries.ListDocumentVersions;
using NGO.PMS.Documents.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Documents.API.Controllers;

[ApiController]
[Route("api/v1/documents")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly ISender _sender;

    public DocumentsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("documents.documents.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? folderId,
        [FromQuery] DocumentCategory? category,
        [FromQuery] DocumentStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _sender.Send(new ListDocumentsQuery(folderId, category, status, search, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("documents.documents.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _sender.Send(new GetDocumentQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("documents.documents.create")]
    public async Task<IActionResult> Upload(UploadDocumentCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}/metadata")]
    [RequirePermission("documents.documents.update")]
    public async Task<IActionResult> UpdateMetadata(Guid id, UpdateDocumentMetadataCommand command)
    {
        if (id != command.DocumentId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/versions")]
    [RequirePermission("documents.documents.create")]
    public async Task<IActionResult> UploadNewVersion(Guid id, UploadNewVersionCommand command)
    {
        if (id != command.DocumentId) return BadRequest();
        var versionId = await _sender.Send(command);
        return Ok(new { id = versionId });
    }

    [HttpGet("{id:guid}/versions")]
    [RequirePermission("documents.documents.read")]
    public async Task<IActionResult> ListVersions(Guid id)
    {
        var result = await _sender.Send(new ListDocumentVersionsQuery(id));
        return Ok(result);
    }

    [HttpPost("{id:guid}/comments")]
    [RequirePermission("documents.comments.create")]
    public async Task<IActionResult> AddComment(Guid id, AddDocumentCommentCommand command)
    {
        if (id != command.DocumentId) return BadRequest();
        var commentId = await _sender.Send(command);
        return Ok(new { id = commentId });
    }
}
