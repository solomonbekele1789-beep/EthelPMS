using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Procurement.Application.Commands.BidEvaluations.EvaluateBid;
using NGO.PMS.Procurement.Application.Commands.RFQs.CreateRfq;
using NGO.PMS.Procurement.Application.Commands.RFQs.SubmitRfqResponse;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Procurement.API.Controllers;

[ApiController]
[Route("api/v1/rfqs")]
[Authorize]
public class RfqsController : ControllerBase
{
    private readonly ISender _sender;
    public RfqsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("procurement.rfqs.create")]
    public async Task<IActionResult> Create(CreateRfqCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/rfqs/{id}", new { id });
    }

    [HttpPost("{id:guid}/responses")]
    [RequirePermission("procurement.rfqs.create")]
    public async Task<IActionResult> SubmitResponse(Guid id, SubmitRfqResponseCommand command)
    {
        if (id != command.RfqId) return BadRequest();
        var responseId = await _sender.Send(command);
        return Created($"api/v1/rfqs/{id}/responses/{responseId}", new { id = responseId });
    }

    [HttpPost("{rfqId:guid}/evaluations")]
    [RequirePermission("procurement.rfqs.read")]
    public async Task<IActionResult> EvaluateBid(Guid rfqId, EvaluateBidCommand command)
    {
        if (rfqId != command.RfqId) return BadRequest();
        var evaluationId = await _sender.Send(command);
        return Created($"api/v1/rfqs/{rfqId}/evaluations/{evaluationId}", new { id = evaluationId });
    }
}
