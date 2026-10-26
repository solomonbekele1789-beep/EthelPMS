using AutoMapper;
using NGO.PMS.Notifications.Application.DTOs;
using NGO.PMS.Notifications.Domain.Entities;

namespace NGO.PMS.Notifications.Application.Mappings;

public class NotificationsMappingProfile : Profile
{
    public NotificationsMappingProfile()
    {
        CreateMap<NotificationTemplate, NotificationTemplateDto>()
            .ForMember(d => d.DefaultChannel, o => o.MapFrom(s => s.DefaultChannel.ToString()));

        CreateMap<Notification, NotificationDto>()
            .ForMember(d => d.Priority, o => o.MapFrom(s => s.Priority.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Channel, o => o.MapFrom(s => s.Channel.ToString()));

        CreateMap<UserNotificationPreference, UserNotificationPreferenceDto>();
    }
}
