using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.ImportExport.Application.Commands.CancelImport;
using NGO.PMS.ImportExport.Application.Commands.StartImport;
using NGO.PMS.ImportExport.Application.Queries.GetImportJobById;
using NGO.PMS.ImportExport.Application.Queries.GetImportJobs;
using NGO.PMS.ImportExport.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.ImportExport.API.Controllers;

[ApiController]
[Route("api/v1/import-jobs")]
[Authorize]
public class ImportJobsController : ControllerBase
{
    private readonly ISender _sender;

    public ImportJobsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("importexport.import.create")]
    public async Task<IActionResult> Start(StartImportCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpGet]
    [RequirePermission("importexport.import.read")]
    public async Task<IActionResult> List([FromQuery] string? module, [FromQuery] ImportJobStatus? status)
        => Ok(await _sender.Send(new GetImportJobsQuery(module, status)));

    [HttpGet("{id:guid}")]
    [RequirePermission("importexport.import.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetImportJobByIdQuery(id)));

    [HttpPut("{id:guid}/cancel")]
    [RequirePermission("importexport.import.update")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await _sender.Send(new CancelImportCommand(id));
        return NoContent();
    }
}
