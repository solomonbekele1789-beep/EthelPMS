namespace NGO.PMS.Training.Application.DTOs;

public class TrainerDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Specialization { get; set; }
    public string? Organization { get; set; }
    public bool IsInternal { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
