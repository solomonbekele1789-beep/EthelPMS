using AutoMapper;
using NGO.PMS.Donors.Application.DTOs;
using NGO.PMS.Donors.Domain.Entities;

namespace NGO.PMS.Donors.Application.Mappings;

public class DonorsMappingProfile : Profile
{
    public DonorsMappingProfile()
    {
        CreateMap<Donor, DonorDto>()
            .ForMember(d => d.Contacts, o => o.MapFrom(s => s.Contacts))
            .ForMember(d => d.GrantCount, o => o.MapFrom(s => s.Grants.Count));

        CreateMap<DonorContact, DonorContactDto>();

        CreateMap<Grant, GrantDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ComplianceStatus, o => o.MapFrom(s => s.ComplianceStatus.ToString()))
            .ForMember(d => d.Conditions, o => o.MapFrom(s => s.Conditions))
            .ForMember(d => d.Reports, o => o.MapFrom(s => s.Reports));

        CreateMap<GrantCondition, GrantConditionDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<GrantReport, GrantReportDto>();

        CreateMap<DonorCommunication, DonorCommunicationDto>()
            .ForMember(d => d.Type, o => o.MapFrom(s => s.Type.ToString()));
    }
}
