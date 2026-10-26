using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.MEAL.Application.Lessons.Commands.CreateLessonLearned;
using NGO.PMS.MEAL.Application.Lessons.Queries.ListLessonsLearned;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.MEAL.API.Controllers;

[ApiController]
[Route("api/v1/lessons-learned")]
[Authorize]
public class LessonsLearnedController : ControllerBase
{
    private readonly ISender _sender;
    public LessonsLearnedController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("meal.plans.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId,
        [FromQuery] string? category)
        => Ok(await _sender.Send(new ListLessonsLearnedQuery(projectId, category)));

    [HttpPost]
    [RequirePermission("meal.plans.create")]
    public async Task<IActionResult> Create(CreateLessonLearnedCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/lessons-learned/{id}", new { id });
    }
}
