using MediatR;

namespace NGO.PMS.Identity.Application.Users.Commands.ActivateUser;

public record ActivateUserCommand(Guid Id) : IRequest;
