using MediatR;

namespace NGO.PMS.Identity.Application.Users.Commands.DeactivateUser;

public record DeactivateUserCommand(Guid Id) : IRequest;
