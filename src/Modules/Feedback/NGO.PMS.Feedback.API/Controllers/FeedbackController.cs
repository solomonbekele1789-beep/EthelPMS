using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Feedback.Application.Commands.AcknowledgeFeedback;
using NGO.PMS.Feedback.Application.Commands.AddFeedbackResponse;
using NGO.PMS.Feedback.Application.Commands.AssignFeedback;
using NGO.PMS.Feedback.Application.Commands.EscalateFeedback;
using NGO.PMS.Feedback.Application.Commands.ResolveFeedback;
using NGO.PMS.Feedback.Application.Commands.SubmitFeedback;
using NGO.PMS.Feedback.Application.Queries.GetFeedbackDashboard;
using NGO.PMS.Feedback.Application.Queries.GetFeedbackItem;
using NGO.PMS.Feedback.Application.Queries.ListFeedbackItems;
using NGO.PMS.Feedback.Domain.Enums;

namespace NGO.PMS.Feedback.API.Controllers;

[ApiController]
[Route("api/v1/feedback")]
[Authorize]
public class FeedbackController : ControllerBase
{
    private readonly ISender _sender;

    public FeedbackController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] FeedbackStatus? status,
        [FromQuery] FeedbackType? type,
        [FromQuery] Guid? feedbackCategoryId,
        [FromQuery] Guid? projectId,
        [FromQuery] bool? isConfidential,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _sender.Send(new ListFeedbackItemsQuery(
            status, type, feedbackCategoryId, projectId, isConfidential, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _sender.Send(new GetFeedbackItemQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Submit(SubmitFeedbackCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPost("{id:guid}/acknowledge")]
    public async Task<IActionResult> Acknowledge(Guid id)
    {
        var result = await _sender.Send(new AcknowledgeFeedbackCommand(id));
        return Ok(new { id = result });
    }

    [HttpPost("{id:guid}/assign")]
    public async Task<IActionResult> Assign(Guid id, AssignFeedbackCommand command)
    {
        if (id != command.FeedbackItemId)
            return BadRequest("Route id does not match command feedback item id.");

        var result = await _sender.Send(command);
        return Ok(new { id = result });
    }

    [HttpPost("{id:guid}/escalate")]
    public async Task<IActionResult> Escalate(Guid id, EscalateFeedbackCommand command)
    {
        if (id != command.FeedbackItemId)
            return BadRequest("Route id does not match command feedback item id.");

        var result = await _sender.Send(command);
        return Ok(new { id = result });
    }

    [HttpPost("{id:guid}/resolve")]
    public async Task<IActionResult> Resolve(Guid id)
    {
        var result = await _sender.Send(new ResolveFeedbackCommand(id));
        return Ok(new { id = result });
    }

    [HttpPost("{id:guid}/responses")]
    public async Task<IActionResult> AddResponse(Guid id, AddFeedbackResponseCommand command)
    {
        if (id != command.FeedbackItemId)
            return BadRequest("Route id does not match command feedback item id.");

        var result = await _sender.Send(command);
        return Ok(new { id = result });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _sender.Send(new GetFeedbackDashboardQuery());
        return Ok(result);
    }
}
