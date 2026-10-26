using MediatR;
using NGO.PMS.Donors.Application.DTOs;

namespace NGO.PMS.Donors.Application.Queries.GetDonor;

public sealed record GetDonorQuery(Guid DonorId) : IRequest<DonorDto>;
