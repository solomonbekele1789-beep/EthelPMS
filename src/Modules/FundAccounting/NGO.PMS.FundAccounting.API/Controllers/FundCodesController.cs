using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.FundAccounting.Application.Commands.FundCodes.CreateFundCode;
using NGO.PMS.FundAccounting.Application.Commands.FundCodes.UpdateFundCode;
using NGO.PMS.FundAccounting.Application.Commands.FundRestrictions.CreateFundRestriction;
using NGO.PMS.FundAccounting.Application.Commands.FundRestrictions.ReleaseFundRestriction;
using NGO.PMS.FundAccounting.Application.Queries.ListFundCodes;
using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.FundAccounting.API.Controllers;

[ApiController]
[Route("api/v1/fund-codes")]
[Authorize]
public class FundCodesController : ControllerBase
{
    private readonly ISender _sender;
    public FundCodesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("fundacct.funds.read")]
    public async Task<IActionResult> List(
        [FromQuery] FundType? fundType = null,
        [FromQuery] bool? isActive = null)
        => Ok(await _sender.Send(new ListFundCodesQuery(fundType, isActive)));

    [HttpPost]
    [RequirePermission("fundacct.funds.create")]
    public async Task<IActionResult> Create(CreateFundCodeCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/fund-codes/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("fundacct.funds.update")]
    public async Task<IActionResult> Update(Guid id, UpdateFundCodeCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{fundCodeId:guid}/restrictions")]
    [RequirePermission("fundacct.restrictions.create")]
    public async Task<IActionResult> CreateRestriction(Guid fundCodeId, CreateFundRestrictionCommand command)
    {
        if (fundCodeId != command.FundCodeId) return BadRequest();
        var id = await _sender.Send(command);
        return Created($"api/v1/fund-codes/{fundCodeId}/restrictions/{id}", new { id });
    }

    [HttpPut("restrictions/{restrictionId:guid}/release")]
    [RequirePermission("fundacct.restrictions.release")]
    public async Task<IActionResult> ReleaseRestriction(Guid restrictionId, ReleaseFundRestrictionCommand command)
    {
        if (restrictionId != command.FundRestrictionId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
