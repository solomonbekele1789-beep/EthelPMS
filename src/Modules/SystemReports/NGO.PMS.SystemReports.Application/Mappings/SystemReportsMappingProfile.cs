using AutoMapper;
using NGO.PMS.SystemReports.Application.DTOs;
using NGO.PMS.SystemReports.Domain.Entities;

namespace NGO.PMS.SystemReports.Application.Mappings;

public class SystemReportsMappingProfile : Profile
{
    public SystemReportsMappingProfile()
    {
        CreateMap<ReportTemplate, ReportTemplateDto>()
            .ForMember(d => d.ReportFormat, o => o.MapFrom(s => s.ReportFormat.ToString()));

        CreateMap<ReportSchedule, ReportScheduleDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.TemplateName, o => o.MapFrom(s => s.ReportTemplate != null ? s.ReportTemplate.Name : string.Empty));

        CreateMap<GeneratedReport, GeneratedReportDto>()
            .ForMember(d => d.ReportFormat, o => o.MapFrom(s => s.ReportFormat.ToString()))
            .ForMember(d => d.TemplateName, o => o.MapFrom(s => s.ReportTemplate != null ? s.ReportTemplate.Name : string.Empty));
    }
}
