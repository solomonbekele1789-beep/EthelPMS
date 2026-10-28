using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Chat.Application.Commands.DeleteMessage;
using NGO.PMS.Chat.Application.Commands.EditMessage;
using NGO.PMS.Chat.Application.Commands.ReactToMessage;
using NGO.PMS.Chat.Application.Commands.SendMessage;
using NGO.PMS.Chat.Application.Queries.ListMessages;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Chat.API.Controllers;

[ApiController]
[Route("api/v1/chat-messages")]
[Authorize]
public class ChatMessagesController : ControllerBase
{
    private readonly ISender _sender;

    public ChatMessagesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("chat.messages.read")]
    public async Task<IActionResult> List([FromQuery] ListMessagesQuery query)
    {
        var result = await _sender.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("chat.messages.send")]
    public async Task<IActionResult> Send(SendMessageCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/chat-messages/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("chat.messages.edit")]
    public async Task<IActionResult> Edit(Guid id, EditMessageCommand command)
    {
        if (id != command.MessageId)
            return BadRequest("Route id does not match command MessageId.");

        var messageId = await _sender.Send(command);
        return Ok(new { id = messageId });
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("chat.messages.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteMessageCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/reactions")]
    [RequirePermission("chat.messages.react")]
    public async Task<IActionResult> React(Guid id, ReactToMessageCommand command)
    {
        if (id != command.MessageId)
            return BadRequest("Route id does not match command MessageId.");

        var messageId = await _sender.Send(command);
        return Ok(new { id = messageId });
    }
}
