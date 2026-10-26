using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Notifications.Application.Commands.Notifications.MarkAllNotificationsRead;
using NGO.PMS.Notifications.Application.Commands.Notifications.MarkNotificationRead;
using NGO.PMS.Notifications.Application.Queries.GetUnreadCount;
using NGO.PMS.Notifications.Application.Queries.ListNotifications;
using NGO.PMS.Notifications.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Notifications.API.Controllers;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ISender _sender;

    public NotificationsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("notifications.notifications.read")]
    public async Task<IActionResult> List(
        [FromQuery] NotificationStatus? status = null,
        [FromQuery] string? eventType = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _sender.Send(new ListNotificationsQuery(status, eventType, page, pageSize));
        return Ok(result);
    }

    [HttpPut("{id:guid}/read")]
    [RequirePermission("notifications.notifications.update")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var notificationId = await _sender.Send(new MarkNotificationReadCommand(id));
        return Ok(new { id = notificationId });
    }

    [HttpPut("read-all")]
    [RequirePermission("notifications.notifications.update")]
    public async Task<IActionResult> MarkAllRead()
    {
        var count = await _sender.Send(new MarkAllNotificationsReadCommand());
        return Ok(new { markedRead = count });
    }

    [HttpGet("unread-count")]
    [RequirePermission("notifications.notifications.read")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var result = await _sender.Send(new GetUnreadCountQuery());
        return Ok(result);
    }
}
