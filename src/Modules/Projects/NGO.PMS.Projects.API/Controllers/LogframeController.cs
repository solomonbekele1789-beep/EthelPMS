using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Projects.Application.ResultsFramework.Queries.GetLogframe;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Projects.API.Controllers;

[ApiController]
[Route("api/v1/projects/{projectId:guid}/logframe")]
[Authorize]
public class LogframeController : ControllerBase
{
    private readonly ISender _sender;
    public LogframeController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("projects.projects.read")]
    public async Task<IActionResult> Get(Guid projectId)
        => Ok(await _sender.Send(new GetLogframeQuery(projectId)));
}
