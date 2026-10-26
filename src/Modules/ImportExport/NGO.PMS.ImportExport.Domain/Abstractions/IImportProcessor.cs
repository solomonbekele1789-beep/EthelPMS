namespace NGO.PMS.ImportExport.Domain.Abstractions;

public interface IImportProcessor
{
    Task<ImportValidationResult> ValidateAsync(Stream fileStream, string columnMappings, string? validationRules, CancellationToken ct = default);
    Task<ImportProcessResult> ProcessAsync(Stream fileStream, string columnMappings, string module, string entityType, CancellationToken ct = default);
}

public record ImportValidationResult(int TotalRows, bool IsValid, List<ImportRowError> Errors);
public record ImportProcessResult(int Processed, int Succeeded, int Failed, List<ImportRowError> Errors);
public record ImportRowError(int RowNumber, string Column, string ErrorMessage);
