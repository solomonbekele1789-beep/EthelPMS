using AutoMapper;
using NGO.PMS.Identity.Application.Users.DTOs;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Application.Mappings;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(d => d.OfficeName, opt => opt.MapFrom(s => s.Office != null ? s.Office.Name : null))
            .ForMember(d => d.Roles, opt => opt.MapFrom(s =>
                s.UserRoles.Select(ur => ur.Role.Name).ToList()));

        CreateMap<User, UserListItemDto>()
            .ForMember(d => d.OfficeName, opt => opt.MapFrom(s => s.Office != null ? s.Office.Name : null))
            .ForMember(d => d.Roles, opt => opt.MapFrom(s =>
                s.UserRoles.Select(ur => ur.Role.Name).ToList()));
    }
}
