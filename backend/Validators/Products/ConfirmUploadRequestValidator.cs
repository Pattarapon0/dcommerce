using FluentValidation;
using backend.DTO.Products;

namespace backend.Validators.Products;

public class ConfirmUploadRequestValidator : AbstractValidator<ConfirmUploadRequest>
{
    public ConfirmUploadRequestValidator()
    {
        RuleFor(x => x.R2Url)
            .NotEmpty()
            .WithMessage("R2 URL is required")
            .Must(BeValidR2Url)
            .WithMessage("Invalid R2 URL format - must be a valid HTTPS URL");
    }

    private static bool BeValidR2Url(string url)
    {
        if (string.IsNullOrEmpty(url))
            return false;

        // Basic URL validation
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            return false;

        // Must be HTTPS
        if (uri.Scheme != "https")
            return false;

        // Should contain some path (not just domain)
        if (string.IsNullOrEmpty(uri.AbsolutePath) || uri.AbsolutePath == "/")
            return false;

        return true;
    }
}