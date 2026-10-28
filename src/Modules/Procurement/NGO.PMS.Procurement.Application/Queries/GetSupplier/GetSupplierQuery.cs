using MediatR;
using NGO.PMS.Procurement.Application.DTOs;

namespace NGO.PMS.Procurement.Application.Queries.GetSupplier;

public sealed record GetSupplierQuery(Guid SupplierId) : IRequest<SupplierDto>;
