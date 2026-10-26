using MediatR;

namespace NGO.PMS.Identity.Application.Users.Commands.ChangeUserPassword;

public record ChangeUserPasswordCommand(string CurrentPassword, string NewPassword) : IRequest;
