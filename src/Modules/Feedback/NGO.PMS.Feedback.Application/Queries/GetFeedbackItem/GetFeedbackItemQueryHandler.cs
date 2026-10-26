using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Feedback.Application.Abstractions;
using NGO.PMS.Feedback.Application.DTOs;

namespace NGO.PMS.Feedback.Application.Queries.GetFeedbackItem;

public sealed class GetFeedbackItemQueryHandler : IRequestHandler<GetFeedbackItemQuery, FeedbackItemDto>
{
    private readonly IFeedbackDbContext _db;
    private readonly IMapper _mapper;

    public GetFeedbackItemQueryHandler(IFeedbackDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<FeedbackItemDto> Handle(GetFeedbackItemQuery request, CancellationToken cancellationToken)
    {
        var item = await _db.FeedbackItems
            .Include(f => f.Responses)
            .FirstOrDefaultAsync(f => f.Id == request.FeedbackItemId, cancellationToken)
            ?? throw new KeyNotFoundException($"Feedback item {request.FeedbackItemId} not found.");

        return _mapper.Map<FeedbackItemDto>(item);
    }
}
