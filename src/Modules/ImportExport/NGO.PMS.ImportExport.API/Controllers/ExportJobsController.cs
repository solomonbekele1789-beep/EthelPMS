using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.ImportExport.Application.Commands.StartExport;
using NGO.PMS.ImportExport.Application.Queries.GetExportJobs;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.ImportExport.API.Controllers;

[ApiController]
[Route("api/v1/export-jobs")]
[Authorize]
public class ExportJobsController : ControllerBase
{
    private readonly ISender _sender;

    public ExportJobsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("importexport.export.create")]
    public async Task<IActionResult> Start(StartExportCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/export-jobs/{id}", new { id });
    }

    [HttpGet]
    [RequirePermission("importexport.export.read")]
    public async Task<IActionResult> List([FromQuery] string? module)
        => Ok(await _sender.Send(new GetExportJobsQuery(module)));
}
