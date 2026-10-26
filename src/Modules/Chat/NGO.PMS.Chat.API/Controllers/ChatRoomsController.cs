using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Chat.Application.Commands.AddParticipant;
using NGO.PMS.Chat.Application.Commands.CreateChatRoom;
using NGO.PMS.Chat.Application.Commands.RemoveParticipant;
using NGO.PMS.Chat.Application.Queries.GetChatRoom;
using NGO.PMS.Chat.Application.Queries.ListChatRooms;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Chat.API.Controllers;

[ApiController]
[Route("api/v1/chat-rooms")]
[Authorize]
public class ChatRoomsController : ControllerBase
{
    private readonly ISender _sender;

    public ChatRoomsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("chat.rooms.read")]
    public async Task<IActionResult> List([FromQuery] ListChatRoomsQuery query)
    {
        var result = await _sender.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("chat.rooms.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _sender.Send(new GetChatRoomQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("chat.rooms.create")]
    public async Task<IActionResult> Create(CreateChatRoomCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPost("{id:guid}/participants")]
    [RequirePermission("chat.rooms.manage")]
    public async Task<IActionResult> AddParticipant(Guid id, AddParticipantCommand command)
    {
        if (id != command.ChatRoomId)
            return BadRequest("Route id does not match command ChatRoomId.");

        var participantId = await _sender.Send(command);
        return Ok(new { id = participantId });
    }

    [HttpDelete("{id:guid}/participants/{userId:guid}")]
    [RequirePermission("chat.rooms.manage")]
    public async Task<IActionResult> RemoveParticipant(Guid id, Guid userId)
    {
        await _sender.Send(new RemoveParticipantCommand(id, userId));
        return NoContent();
    }
}
