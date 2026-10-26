using MediatR;

namespace NGO.PMS.Identity.Application.Auth.Commands.SetupPassword;

public record SetupPasswordCommand(string Token, string Password) : IRequest;
