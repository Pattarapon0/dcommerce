using System.ComponentModel.DataAnnotations;

namespace server.Data.Common;

public abstract class BaseEntity
{
    [Required]
    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }



}

public abstract class BaseSoftDeleteEntity : BaseEntity, ISoftDelete
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

}

public abstract class BaseUserEntity : BaseSoftDeleteEntity
{
    public Guid Id { get; set; }

    public bool IsActive { get; set; } = true;



}
