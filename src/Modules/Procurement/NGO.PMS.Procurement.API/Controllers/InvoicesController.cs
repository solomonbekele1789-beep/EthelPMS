using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Procurement.Application.Commands.Invoices.CreateSupplierInvoice;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Procurement.API.Controllers;

[ApiController]
[Route("api/v1/supplier-invoices")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly ISender _sender;
    public InvoicesController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("procurement.invoices.create")]
    public async Task<IActionResult> Create(CreateSupplierInvoiceCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/supplier-invoices/{id}", new { id });
    }
}
