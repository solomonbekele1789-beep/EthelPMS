using AutoMapper;
using NGO.PMS.Identity.Application.Offices.DTOs;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Application.Mappings;

public class OfficeMappingProfile : Profile
{
    public OfficeMappingProfile()
    {
        CreateMap<Office, OfficeDto>()
            .ForMember(d => d.ParentOfficeName, opt => opt.MapFrom(s => s.ParentOffice != null ? s.ParentOffice.Name : null))
            .ForMember(d => d.ParentOfficeCode, opt => opt.MapFrom(s => s.ParentOffice != null ? s.ParentOffice.Code : null))
            .ForMember(d => d.LocationName, opt => opt.MapFrom(s => s.Location != null ? s.Location.Name : null));
    }
}
