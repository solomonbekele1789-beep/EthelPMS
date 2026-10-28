using MediatR;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.Notifications.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Commands.NotificationTemplates.CreateNotificationTemplate;

public sealed class CreateNotificationTemplateCommandHandler
    : IRequestHandler<CreateNotificationTemplateCommand, Guid>
{
    private readonly INotificationsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateNotificationTemplateCommandHandler(
        INotificationsDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateNotificationTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = NotificationTemplate.Create(
            request.EventType,
            request.TitleTemplateEn,
            request.BodyTemplateEn,
            request.DefaultChannel,
            request.TitleTemplateAm,
            request.BodyTemplateAm);

        _db.NotificationTemplates.Add(template);
        await _db.SaveChangesAsync(cancellationToken);

        return template.Id;
    }
}
