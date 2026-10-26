using MediatR;
using NGO.PMS.Feedback.Application.DTOs;

namespace NGO.PMS.Feedback.Application.Queries.GetFeedbackDashboard;

public sealed record GetFeedbackDashboardQuery() : IRequest<FeedbackDashboardDto>;
