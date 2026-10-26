using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.ImportExport.Application.Commands.CreateImportTemplate;
using NGO.PMS.ImportExport.Application.Commands.DeleteImportTemplate;
using NGO.PMS.ImportExport.Application.Commands.UpdateImportTemplate;
using NGO.PMS.ImportExport.Application.Queries.GetImportTemplateById;
using NGO.PMS.ImportExport.Application.Queries.GetImportTemplates;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.ImportExport.API.Controllers;

[ApiController]
[Route("api/v1/import-templates")]
[Authorize]
public class ImportTemplatesController : ControllerBase
{
    private readonly ISender _sender;

    public ImportTemplatesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("importexport.templates.read")]
    public async Task<IActionResult> List([FromQuery] string? module)
        => Ok(await _sender.Send(new GetImportTemplatesQuery(module)));

    [HttpGet("{id:guid}")]
    [RequirePermission("importexport.templates.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetImportTemplateByIdQuery(id)));

    [HttpPost]
    [RequirePermission("importexport.templates.create")]
    public async Task<IActionResult> Create(CreateImportTemplateCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("importexport.templates.update")]
    public async Task<IActionResult> Update(Guid id, UpdateImportTemplateCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("importexport.templates.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteImportTemplateCommand(id));
        return NoContent();
    }
}
