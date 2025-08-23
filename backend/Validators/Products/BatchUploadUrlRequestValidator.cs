using FluentValidation;
using backend.DTO.Products;

namespace backend.Validators.Products;

public class BatchUploadUrlRequestValidator : AbstractValidator<BatchUploadUrlRequest>
{
    public BatchUploadUrlRequestValidator()
    {
        RuleFor(x => x.FileNames)
            .NotEmpty()
            .WithMessage("FileNames cannot be empty");

        RuleFor(x => x.FileNames)
            .Must(fileNames => fileNames.Count <= 10)
            .WithMessage("Maximum 10 files allowed per batch");

        RuleFor(x => x.FileNames)
            .Must(fileNames => fileNames.All(fn => !string.IsNullOrWhiteSpace(fn)))
            .WithMessage("All file names must be provided");

        RuleForEach(x => x.FileNames)
            .NotEmpty()
            .WithMessage("File name cannot be empty")
            .MaximumLength(255)
            .WithMessage("File name too long");
    }
}