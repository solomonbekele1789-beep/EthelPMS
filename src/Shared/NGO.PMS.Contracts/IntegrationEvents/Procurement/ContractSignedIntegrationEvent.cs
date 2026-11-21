namespace NGO.PMS.Contracts.IntegrationEvents.Procurement;

public sealed record ContractSignedIntegrationEvent(
    Guid ContractId,
    Guid VendorId,
    decimal ContractValue,
    string Currency) : IntegrationEvent;
