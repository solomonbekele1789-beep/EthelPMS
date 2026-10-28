using AutoMapper;
using NGO.PMS.Procurement.Application.DTOs;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Application.Mappings;

public class ProcurementMappingProfile : Profile
{
    public ProcurementMappingProfile()
    {
        CreateMap<Supplier, SupplierDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<ProcurementPlan, ProcurementPlanDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<ProcurementPlanItem, ProcurementPlanItemDto>()
            .ForMember(d => d.Method, o => o.MapFrom(s => s.Method.ToString()));

        CreateMap<PurchaseRequest, PurchaseRequestDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Method, o => o.MapFrom(s => s.Method.ToString()));

        CreateMap<PurchaseRequestItem, PurchaseRequestItemDto>();

        CreateMap<RequestForQuotation, RfqDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<RfqItem, RfqItemDto>();

        CreateMap<RfqResponse, RfqResponseDto>();

        CreateMap<PurchaseOrder, PurchaseOrderDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<PurchaseOrderItem, PurchaseOrderItemDto>();

        CreateMap<GoodsReceivedNote, GoodsReceivedNoteDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<GrnItem, GrnItemDto>();

        CreateMap<SupplierInvoice, SupplierInvoiceDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ThreeWayMatchStatus, o => o.MapFrom(s => s.ThreeWayMatchStatus.ToString()));

        CreateMap<PaymentRequest, PaymentRequestDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
    }
}
