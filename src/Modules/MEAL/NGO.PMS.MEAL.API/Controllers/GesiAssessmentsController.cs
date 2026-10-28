using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.MEAL.Application.Gesi.Commands.CreateGesiAssessment;
using NGO.PMS.MEAL.Application.Gesi.Queries.ListGesiAssessments;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.MEAL.API.Controllers;

[ApiController]
[Route("api/v1/gesi-assessments")]
[Authorize]
public class GesiAssessmentsController : ControllerBase
{
    private readonly ISender _sender;
    public GesiAssessmentsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("meal.plans.read")]
    public async Task<IActionResult> List([FromQuery] Guid projectId)
        => Ok(await _sender.Send(new ListGesiAssessmentsQuery(projectId)));

    [HttpPost]
    [RequirePermission("meal.plans.create")]
    public async Task<IActionResult> Create(CreateGesiAssessmentCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/gesi-assessments/{id}", new { id });
    }
}
