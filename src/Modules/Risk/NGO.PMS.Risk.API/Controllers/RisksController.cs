using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Risk.Application.Risks.Commands.CompleteMitigation;
using NGO.PMS.Risk.Application.Risks.Commands.CreateMitigation;
using NGO.PMS.Risk.Application.Risks.Commands.CreateRisk;
using NGO.PMS.Risk.Application.Risks.Commands.ReassessRisk;
using NGO.PMS.Risk.Application.Risks.Commands.RecordRiskAssessment;
using NGO.PMS.Risk.Application.Risks.Commands.ResolveRisk;
using NGO.PMS.Risk.Application.Risks.Queries.GetRisk;
using NGO.PMS.Risk.Application.Risks.Queries.GetRiskMatrix;
using NGO.PMS.Risk.Application.Risks.Queries.ListRisks;
using NGO.PMS.Risk.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Risk.API.Controllers;

[ApiController]
[Route("api/v1/risks")]
[Authorize]
public class RisksController : ControllerBase
{
    private readonly ISender _sender;

    public RisksController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("risk.risks.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId,
        [FromQuery] RiskStatus? status,
        [FromQuery] Guid? categoryId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _sender.Send(new ListRisksQuery(projectId, status, categoryId, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("risk.risks.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _sender.Send(new GetRiskQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("risk.risks.create")]
    public async Task<IActionResult> Create(CreateRiskCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}/reassess")]
    [RequirePermission("risk.risks.update")]
    public async Task<IActionResult> Reassess(Guid id, ReassessRiskCommand command)
    {
        if (id != command.RiskId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id:guid}/resolve")]
    [RequirePermission("risk.risks.update")]
    public async Task<IActionResult> Resolve(Guid id)
    {
        await _sender.Send(new ResolveRiskCommand(id));
        return NoContent();
    }

    [HttpGet("matrix")]
    [RequirePermission("risk.risks.read")]
    public async Task<IActionResult> GetMatrix([FromQuery] Guid projectId)
    {
        var result = await _sender.Send(new GetRiskMatrixQuery(projectId));
        return Ok(result);
    }

    [HttpPost("{id:guid}/mitigations")]
    [RequirePermission("risk.mitigations.create")]
    public async Task<IActionResult> CreateMitigation(Guid id, CreateMitigationCommand command)
    {
        if (id != command.RiskId) return BadRequest();
        var mitigationId = await _sender.Send(command);
        return Created($"api/v1/risks/{id}/mitigations/{mitigationId}", new { id = mitigationId });
    }

    [HttpPut("{riskId:guid}/mitigations/{mitigationId:guid}/complete")]
    [RequirePermission("risk.mitigations.update")]
    public async Task<IActionResult> CompleteMitigation(Guid riskId, Guid mitigationId)
    {
        await _sender.Send(new CompleteMitigationCommand(mitigationId));
        return NoContent();
    }

    [HttpPost("{id:guid}/assessments")]
    [RequirePermission("risk.assessments.create")]
    public async Task<IActionResult> RecordAssessment(Guid id, RecordRiskAssessmentCommand command)
    {
        if (id != command.RiskId) return BadRequest();
        var assessmentId = await _sender.Send(command);
        return Created($"api/v1/risks/{id}/assessments/{assessmentId}", new { id = assessmentId });
    }
}
