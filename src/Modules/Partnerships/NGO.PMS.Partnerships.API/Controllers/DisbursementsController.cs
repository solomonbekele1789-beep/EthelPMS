using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Partnerships.Application.Commands.ApproveDisbursement;
using NGO.PMS.Partnerships.Application.Commands.CreateDisbursement;
using NGO.PMS.Partnerships.Application.Commands.DisburseFunds;
using NGO.PMS.Partnerships.Application.Commands.RejectDisbursement;
using NGO.PMS.Partnerships.Application.Queries.GetDisbursements;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Partnerships.API.Controllers;

[ApiController]
[Route("api/v1/disbursements")]
[Authorize]
public class DisbursementsController : ControllerBase
{
    private readonly ISender _sender;

    public DisbursementsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("partnerships.disbursements.create")]
    public async Task<IActionResult> Create(CreateDisbursementCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/disbursements/{id}", new { id });
    }

    [HttpGet]
    [RequirePermission("partnerships.disbursements.read")]
    public async Task<IActionResult> List([FromQuery] Guid? subGranteeId)
        => Ok(await _sender.Send(new GetDisbursementsQuery(subGranteeId)));

    [HttpPut("{id:guid}/approve")]
    [RequirePermission("partnerships.disbursements.update")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _sender.Send(new ApproveDisbursementCommand(id));
        return NoContent();
    }

    [HttpPut("{id:guid}/disburse")]
    [RequirePermission("partnerships.disbursements.update")]
    public async Task<IActionResult> Disburse(Guid id)
    {
        await _sender.Send(new DisburseFundsCommand(id));
        return NoContent();
    }

    [HttpPut("{id:guid}/reject")]
    [RequirePermission("partnerships.disbursements.update")]
    public async Task<IActionResult> Reject(Guid id)
    {
        await _sender.Send(new RejectDisbursementCommand(id));
        return NoContent();
    }
}
