using AutoMapper;
using NGO.PMS.Documents.Application.DTOs;
using NGO.PMS.Documents.Domain.Entities;

namespace NGO.PMS.Documents.Application.Mappings;

public class DocumentsMappingProfile : Profile
{
    public DocumentsMappingProfile()
    {
        CreateMap<DocumentFolder, DocumentFolderDto>()
            .ForMember(d => d.DocumentCount, o => o.MapFrom(s => s.Documents.Count));

        CreateMap<DocumentFolder, FolderTreeDto>()
            .ForMember(d => d.Children, o => o.MapFrom(s => s.SubFolders));

        CreateMap<Document, DocumentDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Category, o => o.MapFrom(s => s.Category.ToString()))
            .ForMember(d => d.VersionCount, o => o.MapFrom(s => s.Versions.Count))
            .ForMember(d => d.LatestVersion, o => o.MapFrom(s => s.Versions
                .OrderByDescending(v => v.VersionNumber).FirstOrDefault()));

        CreateMap<DocumentVersion, DocumentVersionDto>();

        CreateMap<DocumentComment, DocumentCommentDto>();
    }
}
