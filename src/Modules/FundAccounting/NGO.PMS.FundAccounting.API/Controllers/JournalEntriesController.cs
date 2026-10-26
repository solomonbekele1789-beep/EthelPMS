using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.FundAccounting.Application.Commands.JournalEntries.CreateJournalEntry;
using NGO.PMS.FundAccounting.Application.Commands.JournalEntries.PostJournalEntry;
using NGO.PMS.FundAccounting.Application.Queries.ListJournalEntries;
using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.FundAccounting.API.Controllers;

[ApiController]
[Route("api/v1/journal-entries")]
[Authorize]
public class JournalEntriesController : ControllerBase
{
    private readonly ISender _sender;
    public JournalEntriesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("fundacct.journals.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId = null,
        [FromQuery] Guid? fundCodeId = null,
        [FromQuery] JournalEntryStatus? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListJournalEntriesQuery(projectId, fundCodeId, status, page, pageSize)));

    [HttpPost]
    [RequirePermission("fundacct.journals.create")]
    public async Task<IActionResult> Create(CreateJournalEntryCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/journal-entries/{id}", new { id });
    }

    [HttpPut("{id:guid}/post")]
    [RequirePermission("fundacct.journals.post")]
    public async Task<IActionResult> Post(Guid id)
    {
        await _sender.Send(new PostJournalEntryCommand(id));
        return NoContent();
    }
}
