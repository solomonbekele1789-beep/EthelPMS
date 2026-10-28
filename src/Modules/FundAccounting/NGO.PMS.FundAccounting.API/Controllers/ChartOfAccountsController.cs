using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.FundAccounting.Application.Commands.AccountCategories.CreateAccountCategory;
using NGO.PMS.FundAccounting.Application.Commands.ChartOfAccounts.CreateChartOfAccount;
using NGO.PMS.FundAccounting.Application.Commands.ChartOfAccounts.UpdateChartOfAccount;
using NGO.PMS.FundAccounting.Application.Queries.ListAccountCategories;
using NGO.PMS.FundAccounting.Application.Queries.ListChartOfAccounts;
using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.FundAccounting.API.Controllers;

[ApiController]
[Route("api/v1/chart-of-accounts")]
[Authorize]
public class ChartOfAccountsController : ControllerBase
{
    private readonly ISender _sender;
    public ChartOfAccountsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("fundacct.accounts.read")]
    public async Task<IActionResult> List(
        [FromQuery] AccountType? accountType = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null)
        => Ok(await _sender.Send(new ListChartOfAccountsQuery(accountType, search, isActive)));

    [HttpPost]
    [RequirePermission("fundacct.accounts.create")]
    public async Task<IActionResult> Create(CreateChartOfAccountCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/chart-of-accounts/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("fundacct.accounts.update")]
    public async Task<IActionResult> Update(Guid id, UpdateChartOfAccountCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpGet("categories")]
    [RequirePermission("fundacct.accounts.read")]
    public async Task<IActionResult> ListCategories()
        => Ok(await _sender.Send(new ListAccountCategoriesQuery()));
}
