namespace NGO.PMS.SharedKernel.Exceptions;

/// <summary>
/// Thrown when a requested entity is not found. Maps to HTTP 404.
/// </summary>
public class NotFoundException : Exception
{
    public string EntityName { get; }
    public object EntityId { get; }

    public NotFoundException(string entityName, object entityId)
        : base($"{entityName} with ID '{entityId}' was not found.")
    {
        EntityName = entityName;
        EntityId = entityId;
    }
}
