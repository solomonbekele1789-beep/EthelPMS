using MediatR;

namespace NGO.PMS.Identity.Application.Users.Commands.UpdateUser;

public record UpdateUserCommand(Guid Id, string FirstName, string LastName, string? Phone, Guid? OfficeId) : IRequest;
