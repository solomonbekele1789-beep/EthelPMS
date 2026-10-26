using MediatR;
using NGO.PMS.Procurement.Application.DTOs;

namespace NGO.PMS.Procurement.Application.Queries.ListSuppliers;

public sealed record ListSuppliersQuery(
    string? Status,
    string? Search) : IRequest<List<SupplierDto>>;
