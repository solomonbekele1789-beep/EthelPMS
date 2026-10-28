namespace NGO.PMS.ImportExport.Domain.Enums;

public enum ImportJobStatus
{
    Pending,
    Validating,
    Validated,
    Processing,
    Completed,
    CompletedWithErrors,
    Failed,
    Cancelled
}
