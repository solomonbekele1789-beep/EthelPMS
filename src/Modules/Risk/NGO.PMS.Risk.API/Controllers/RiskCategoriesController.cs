using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Risk.Application.RiskCategories.Commands.CreateRiskCategory;
using NGO.PMS.Risk.Application.RiskCategories.Queries.ListRiskCategories;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Risk.API.Controllers;

[ApiController]
[Route("api/v1/risk-categories")]
[Authorize]
public class RiskCategoriesController : ControllerBase
{
    private readonly ISender _sender;

    public RiskCategoriesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("risk.categories.read")]
    public async Task<IActionResult> List()
    {
        var result = await _sender.Send(new ListRiskCategoriesQuery());
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("risk.categories.create")]
    public async Task<IActionResult> Create(CreateRiskCategoryCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/risk-categories/{id}", new { id });
    }
}
