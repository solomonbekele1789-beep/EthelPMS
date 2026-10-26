using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Notifications.Application.Commands.NotificationPreferences.UpdateNotificationPreference;
using NGO.PMS.Notifications.Application.Queries.GetNotificationPreferences;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Notifications.API.Controllers;

[ApiController]
[Route("api/v1/notification-preferences")]
[Authorize]
public class NotificationPreferencesController : ControllerBase
{
    private readonly ISender _sender;

    public NotificationPreferencesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("notifications.preferences.read")]
    public async Task<IActionResult> Get([FromQuery] Guid? userId = null)
    {
        var result = await _sender.Send(new GetNotificationPreferencesQuery(userId));
        return Ok(result);
    }

    [HttpPut]
    [RequirePermission("notifications.preferences.update")]
    public async Task<IActionResult> Update(UpdateNotificationPreferenceCommand command)
    {
        var id = await _sender.Send(command);
        return Ok(new { id });
    }
}
