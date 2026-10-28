using MediatR;

namespace NGO.PMS.Identity.Application.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand(string Email) : IRequest;
