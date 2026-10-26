using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.KnowledgeMgmt.Application.Commands.AddArticleComment;
using NGO.PMS.KnowledgeMgmt.Application.Commands.ArchiveArticle;
using NGO.PMS.KnowledgeMgmt.Application.Commands.CreateArticle;
using NGO.PMS.KnowledgeMgmt.Application.Commands.DeleteArticle;
using NGO.PMS.KnowledgeMgmt.Application.Commands.IncrementViewCount;
using NGO.PMS.KnowledgeMgmt.Application.Commands.PublishArticle;
using NGO.PMS.KnowledgeMgmt.Application.Commands.UpdateArticle;
using NGO.PMS.KnowledgeMgmt.Application.Queries.GetArticleById;
using NGO.PMS.KnowledgeMgmt.Application.Queries.GetArticleComments;
using NGO.PMS.KnowledgeMgmt.Application.Queries.GetArticles;
using NGO.PMS.KnowledgeMgmt.Application.Queries.SearchArticles;
using NGO.PMS.KnowledgeMgmt.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.KnowledgeMgmt.API.Controllers;

[ApiController]
[Route("api/kb/articles")]
[Authorize]
public class KbArticlesController : ControllerBase
{
    private readonly ISender _sender;

    public KbArticlesController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("knowledge.articles.create")]
    public async Task<IActionResult> Create(CreateArticleCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpGet]
    [RequirePermission("knowledge.articles.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? categoryId,
        [FromQuery] ArticleType? articleType,
        [FromQuery] ArticleStatus? status,
        [FromQuery] string? searchTerm,
        [FromQuery] string? tags)
        => Ok(await _sender.Send(new GetArticlesQuery(categoryId, articleType, status, searchTerm, tags)));

    [HttpGet("search")]
    [RequirePermission("knowledge.articles.read")]
    public async Task<IActionResult> Search([FromQuery] string term)
        => Ok(await _sender.Send(new SearchArticlesQuery(term)));

    [HttpGet("{id:guid}")]
    [RequirePermission("knowledge.articles.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        await _sender.Send(new IncrementViewCountCommand(id));
        return Ok(await _sender.Send(new GetArticleByIdQuery(id)));
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("knowledge.articles.update")]
    public async Task<IActionResult> Update(Guid id, UpdateArticleCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id:guid}/publish")]
    [RequirePermission("knowledge.articles.update")]
    public async Task<IActionResult> Publish(Guid id)
    {
        await _sender.Send(new PublishArticleCommand(id));
        return NoContent();
    }

    [HttpPut("{id:guid}/archive")]
    [RequirePermission("knowledge.articles.update")]
    public async Task<IActionResult> Archive(Guid id)
    {
        await _sender.Send(new ArchiveArticleCommand(id));
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("knowledge.articles.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteArticleCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/comments")]
    [RequirePermission("knowledge.articles.update")]
    public async Task<IActionResult> AddComment(Guid id, AddArticleCommentCommand command)
    {
        if (id != command.ArticleId) return BadRequest();
        var commentId = await _sender.Send(command);
        return Created($"api/kb/articles/{id}/comments/{commentId}", new { id = commentId });
    }

    [HttpGet("{id:guid}/comments")]
    [RequirePermission("knowledge.articles.read")]
    public async Task<IActionResult> GetComments(Guid id)
        => Ok(await _sender.Send(new GetArticleCommentsQuery(id)));
}
