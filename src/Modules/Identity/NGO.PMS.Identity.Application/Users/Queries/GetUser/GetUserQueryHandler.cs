using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Users.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Users.Queries.GetUser;

public class GetUserQueryHandler : IRequestHandler<GetUserQuery, UserDto>
{
    private readonly IIdentityDbContext _db;
    private readonly IMapper _mapper;

    public GetUserQueryHandler(IIdentityDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .Include(u => u.Office)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("User", request.Id);

        return _mapper.Map<UserDto>(user);
    }
}
