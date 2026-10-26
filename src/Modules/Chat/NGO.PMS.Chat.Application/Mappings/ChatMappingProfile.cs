using AutoMapper;
using NGO.PMS.Chat.Application.DTOs;
using NGO.PMS.Chat.Domain.Entities;

namespace NGO.PMS.Chat.Application.Mappings;

public class ChatMappingProfile : Profile
{
    public ChatMappingProfile()
    {
        CreateMap<ChatRoom, ChatRoomDto>()
            .ForMember(d => d.Type, o => o.MapFrom(s => s.Type.ToString()))
            .ForMember(d => d.ParticipantCount, o => o.MapFrom(s => s.Participants.Count))
            .ForMember(d => d.LastMessagePreview, o => o.MapFrom(s =>
                s.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.Content).FirstOrDefault()));

        CreateMap<ChatParticipant, ChatParticipantDto>()
            .ForMember(d => d.Presence, o => o.MapFrom(s => s.Presence.ToString()));

        CreateMap<ChatMessage, ChatMessageDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ThreadReplyCount, o => o.Ignore());
    }
}
