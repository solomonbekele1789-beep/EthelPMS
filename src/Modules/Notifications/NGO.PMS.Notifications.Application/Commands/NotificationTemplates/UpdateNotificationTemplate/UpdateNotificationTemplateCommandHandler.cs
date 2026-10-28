using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Commands.NotificationTemplates.UpdateNotificationTemplate;

public sealed class UpdateNotificationTemplateCommandHandler
    : IRequestHandler<UpdateNotificationTemplateCommand, Guid>
{
    private readonly INotificationsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateNotificationTemplateCommandHandler(
        INotificationsDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(UpdateNotificationTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await _db.NotificationTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Notification template {request.Id} not found.");

        template.Update(
            request.TitleTemplateEn,
            request.BodyTemplateEn,
            request.DefaultChannel,
            request.TitleTemplateAm,
            request.BodyTemplateAm);

        await _db.SaveChangesAsync(cancellationToken);

        return template.Id;
    }
}
