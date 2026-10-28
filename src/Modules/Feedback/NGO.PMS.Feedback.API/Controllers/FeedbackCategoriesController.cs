using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Feedback.Application.Commands.CreateFeedbackCategory;
using NGO.PMS.Feedback.Application.Commands.UpdateFeedbackCategory;
using NGO.PMS.Feedback.Application.Queries.ListFeedbackCategories;

namespace NGO.PMS.Feedback.API.Controllers;

[ApiController]
[Route("api/v1/feedback-categories")]
[Authorize]
public class FeedbackCategoriesController : ControllerBase
{
    private readonly ISender _sender;

    public FeedbackCategoriesController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var result = await _sender.Send(new ListFeedbackCategoriesQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFeedbackCategoryCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(List), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateFeedbackCategoryCommand command)
    {
        if (id != command.Id)
            return BadRequest("Route id does not match command id.");

        var result = await _sender.Send(command);
        return Ok(new { id = result });
    }
}
