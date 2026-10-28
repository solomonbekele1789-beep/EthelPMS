using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Procurement.Application.Commands.Payments.CreatePaymentRequest;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Procurement.API.Controllers;

[ApiController]
[Route("api/v1/payment-requests")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly ISender _sender;
    public PaymentsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("procurement.payments.create")]
    public async Task<IActionResult> Create(CreatePaymentRequestCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/payment-requests/{id}", new { id });
    }
}
