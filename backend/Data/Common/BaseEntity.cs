using System.ComponentModel.DataAnnotations;

namespace backend.Data.Common;

// Interface for soft delete functionality
public interface ISoftDelete
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
}

// Simple base entity with Guid ID for all e-commerce entities
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

// For entities that need soft delete functionality
public abstract class BaseSoftDeleteEntity : BaseEntity, ISoftDelete
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}

// For user-related entities that need activation control
public abstract class BaseUserEntity : BaseSoftDeleteEntity
{
    public bool IsActive { get; set; } = true;
}
