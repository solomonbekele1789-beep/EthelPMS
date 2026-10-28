using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Partnerships.Application.Queries.GetPartnershipDashboard;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Partnerships.API.Controllers;

[ApiController]
[Route("api/v1/partnerships/dashboard")]
[Authorize]
public class PartnershipDashboardController : ControllerBase
{
    private readonly ISender _sender;

    public PartnershipDashboardController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("partnerships.dashboard.read")]
    public async Task<IActionResult> Get()
        => Ok(await _sender.Send(new GetPartnershipDashboardQuery()));
}
