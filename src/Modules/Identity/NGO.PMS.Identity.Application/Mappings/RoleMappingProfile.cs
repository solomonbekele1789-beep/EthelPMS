using AutoMapper;
using NGO.PMS.Identity.Application.Roles.DTOs;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Application.Mappings;

public class RoleMappingProfile : Profile
{
    public RoleMappingProfile()
    {
        CreateMap<Role, RoleDto>()
            .ForMember(d => d.Permissions, opt => opt.MapFrom(s =>
                s.RolePermissions.Select(rp => rp.Permission).ToList()));

        CreateMap<Role, RoleListItemDto>()
            .ForMember(d => d.PermissionCount, opt => opt.MapFrom(s => s.RolePermissions.Count))
            .ForMember(d => d.UserCount, opt => opt.MapFrom(s => s.UserRoles.Count));

        CreateMap<Permission, PermissionDto>();
    }
}
