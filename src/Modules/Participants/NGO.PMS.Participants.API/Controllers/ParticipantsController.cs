using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Participants.Application.Participants.Commands.AddHouseholdMember;
using NGO.PMS.Participants.Application.Participants.Commands.EnrollParticipant;
using NGO.PMS.Participants.Application.Participants.Commands.ExitEnrollment;
using NGO.PMS.Participants.Application.Participants.Commands.RecordService;
using NGO.PMS.Participants.Application.Participants.Commands.RegisterParticipant;
using NGO.PMS.Participants.Application.Participants.Commands.UpdateParticipant;
using NGO.PMS.Participants.Application.Participants.Commands.UpdateParticipantAddress;
using NGO.PMS.Participants.Application.Participants.Queries.GetParticipant;
using NGO.PMS.Participants.Application.Participants.Queries.ListHouseholdMembers;
using NGO.PMS.Participants.Application.Participants.Queries.ListParticipants;
using NGO.PMS.Participants.Application.Participants.Queries.ListParticipantServices;
using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Participants.API.Controllers;

[ApiController]
[Route("api/v1/participants")]
[Authorize]
public class ParticipantsController : ControllerBase
{
    private readonly ISender _sender;
    public ParticipantsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("participants.profiles.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId,
        [FromQuery] ParticipantStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListParticipantsQuery(projectId, status, search, page, pageSize)));

    [HttpGet("{id:guid}")]
    [RequirePermission("participants.profiles.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetParticipantQuery(id)));

    [HttpPost]
    [RequirePermission("participants.profiles.create")]
    public async Task<IActionResult> Register(RegisterParticipantCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("participants.profiles.update")]
    public async Task<IActionResult> Update(Guid id, UpdateParticipantCommand command)
    {
        if (id != command.ParticipantId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id:guid}/address")]
    [RequirePermission("participants.profiles.update")]
    public async Task<IActionResult> UpdateAddress(Guid id, UpdateParticipantAddressCommand command)
    {
        if (id != command.ParticipantId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    // ── Enrollment ──────────────────────────────────────

    [HttpPost("{id:guid}/enrollments")]
    [RequirePermission("participants.profiles.update")]
    public async Task<IActionResult> Enroll(Guid id, EnrollParticipantCommand command)
    {
        if (id != command.ParticipantId) return BadRequest();
        var enrollmentId = await _sender.Send(command);
        return Created($"api/v1/participants/{id}/enrollments/{enrollmentId}", new { id = enrollmentId });
    }

    [HttpPost("enrollments/{enrollmentId:guid}/exit")]
    [RequirePermission("participants.profiles.update")]
    public async Task<IActionResult> ExitEnrollment(Guid enrollmentId, ExitEnrollmentCommand command)
    {
        if (enrollmentId != command.EnrollmentId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    // ── Household ───────────────────────────────────────

    [HttpPost("{id:guid}/household")]
    [RequirePermission("participants.profiles.update")]
    public async Task<IActionResult> AddHouseholdMember(Guid id, AddHouseholdMemberCommand command)
    {
        if (id != command.ParticipantId) return BadRequest();
        var memberId = await _sender.Send(command);
        return Created($"api/v1/participants/{id}/household/{memberId}", new { id = memberId });
    }

    [HttpGet("household/{householdCode}")]
    [RequirePermission("participants.profiles.read")]
    public async Task<IActionResult> ListHouseholdMembers(string householdCode)
        => Ok(await _sender.Send(new ListHouseholdMembersQuery(householdCode)));

    // ── Services ────────────────────────────────────────

    [HttpPost("{id:guid}/services")]
    [RequirePermission("participants.profiles.update")]
    public async Task<IActionResult> RecordService(Guid id, RecordServiceCommand command)
    {
        if (id != command.ParticipantId) return BadRequest();
        var serviceId = await _sender.Send(command);
        return Created($"api/v1/participants/{id}/services/{serviceId}", new { id = serviceId });
    }

    [HttpGet("{id:guid}/services")]
    [RequirePermission("participants.profiles.read")]
    public async Task<IActionResult> ListServices(Guid id, [FromQuery] Guid? projectId)
        => Ok(await _sender.Send(new ListParticipantServicesQuery(id, projectId)));
}
