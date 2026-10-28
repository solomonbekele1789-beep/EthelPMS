using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Donors.Application.Commands.RecordCommunication;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Donors.API.Controllers;

[ApiController]
[Route("api/v1/donor-communications")]
[Authorize]
public class DonorCommunicationsController : ControllerBase
{
    private readonly ISender _sender;

    public DonorCommunicationsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("donors.communications.create")]
    public async Task<IActionResult> Record(RecordCommunicationCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/donor-communications/{id}", new { id });
    }
}
