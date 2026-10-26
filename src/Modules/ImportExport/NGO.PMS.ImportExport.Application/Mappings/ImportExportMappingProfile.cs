using AutoMapper;
using NGO.PMS.ImportExport.Application.DTOs;
using NGO.PMS.ImportExport.Domain.Entities;

namespace NGO.PMS.ImportExport.Application.Mappings;

public class ImportExportMappingProfile : Profile
{
    public ImportExportMappingProfile()
    {
        CreateMap<ImportTemplate, ImportTemplateDto>()
            .ForMember(d => d.FileFormat, o => o.MapFrom(s => s.FileFormat.ToString()));

        CreateMap<ImportJob, ImportJobDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<ImportJob, ImportJobListDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<ExportJob, ExportJobDto>()
            .ForMember(d => d.ExportFormat, o => o.MapFrom(s => s.ExportFormat.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<DataSyncConfig, DataSyncConfigDto>()
            .ForMember(d => d.SourceType, o => o.MapFrom(s => s.SourceType.ToString()));
    }
}
