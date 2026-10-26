using AutoMapper;
using NGO.PMS.Tasks.Application.DTOs;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Application.Mappings;

public class TasksMappingProfile : Profile
{
    public TasksMappingProfile()
    {
        CreateMap<TaskBoard, TaskBoardDto>();

        CreateMap<TaskList, TaskListDto>()
            .ForMember(d => d.TaskCount, o => o.MapFrom(s => s.Tasks.Count));

        CreateMap<TaskItem, TaskItemDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Priority, o => o.MapFrom(s => s.Priority.ToString()))
            .ForMember(d => d.CommentsCount, o => o.MapFrom(s => s.Comments.Count));

        CreateMap<TaskAssignment, TaskAssignmentDto>();

        CreateMap<TaskComment, TaskCommentDto>();

        CreateMap<TaskApprovalLog, TaskApprovalLogDto>()
            .ForMember(d => d.Action, o => o.MapFrom(s => s.Action.ToString()));
    }
}
