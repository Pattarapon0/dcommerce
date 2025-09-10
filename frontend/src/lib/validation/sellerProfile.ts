import * as v from 'valibot';

export const sellerProfileSchema = v.object({
    businessName: v.pipe(
        v.string(),
        v.trim(),
        v.nonEmpty('Business name is required'),
        v.minLength(2, 'Business name must be at least 2 characters'),
        v.maxLength(200, 'Business name cannot exceed 200 characters'),
        v.regex(/^[\p{L}\p{N}\s\-&.,'()]+$/u, 'Business name contains invalid characters')
    ),
    businessDescription: v.pipe(
        v.string(),
        v.trim(),
        v.maxLength(1000, 'Business description cannot exceed 1000 characters')
    )
});

export type sellerProfileFormData = v.InferInput<typeof sellerProfileSchema>;