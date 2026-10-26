using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Assets.Application.Commands.Disposals.CompleteDisposal;
using NGO.PMS.Assets.Application.Commands.Disposals.InitiateDisposal;
using NGO.PMS.Assets.Application.Queries.ListDisposals;
using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Assets.API.Controllers;

[ApiController]
[Route("api/v1/asset-disposals")]
[Authorize]
public class DisposalsController : ControllerBase
{
    private readonly ISender _sender;
    public DisposalsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("assets.disposals.read")]
    public async Task<IActionResult> List(
        [FromQuery] DisposalStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListDisposalsQuery(status, page, pageSize)));

    [HttpPost]
    [RequirePermission("assets.disposals.create")]
    public async Task<IActionResult> Initiate(InitiateDisposalCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/asset-disposals/{id}", new { id });
    }

    [HttpPut("{id:guid}/complete")]
    [RequirePermission("assets.disposals.approve")]
    public async Task<IActionResult> Complete(Guid id, CompleteDisposalCommand command)
    {
        if (id != command.DisposalId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
