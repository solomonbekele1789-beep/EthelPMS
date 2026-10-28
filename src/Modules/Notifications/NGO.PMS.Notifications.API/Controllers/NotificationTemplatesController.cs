using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Notifications.Application.Commands.NotificationTemplates.CreateNotificationTemplate;
using NGO.PMS.Notifications.Application.Commands.NotificationTemplates.UpdateNotificationTemplate;
using NGO.PMS.Notifications.Application.Queries.ListNotificationTemplates;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Notifications.API.Controllers;

[ApiController]
[Route("api/v1/notification-templates")]
[Authorize]
public class NotificationTemplatesController : ControllerBase
{
    private readonly ISender _sender;

    public NotificationTemplatesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("notifications.templates.read")]
    public async Task<IActionResult> List(
        [FromQuery] bool? isActive = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _sender.Send(new ListNotificationTemplatesQuery(isActive, page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("notifications.templates.create")]
    public async Task<IActionResult> Create(CreateNotificationTemplateCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(List), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("notifications.templates.update")]
    public async Task<IActionResult> Update(Guid id, UpdateNotificationTemplateCommand command)
    {
        if (id != command.Id)
            return BadRequest("Route id does not match command id.");

        var templateId = await _sender.Send(command);
        return Ok(new { id = templateId });
    }
}
