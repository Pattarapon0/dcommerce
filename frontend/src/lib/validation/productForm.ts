import * as v from "valibot";
import { ProductCategory } from "@/components/forms/fields/category-select";
export const productFormSchema = v.object({
    name: v.pipe(
        v.string(),
        v.nonEmpty('Product name is required'),
        v.minLength(2, 'Product name must be at least 2 characters long'),
        v.maxLength(200, 'Product name must be at most 200 characters long'),
        v.regex(/^[a-zA-Z\s'-]+$/, 'Product name contains invalid characters')
    ),

    description: v.pipe(
        v.string(),
        v.nonEmpty('Product description is required'),
        v.minLength(10, 'Product description must be at least 10 characters long'),
        v.maxLength(2000, 'Product description must be at most 2000 characters long'),
        v.regex(/^[a-zA-Z\s'-]+$/, 'Product description contains invalid characters')
    ),
    price: v.pipe(
        v.number(),
        v.minValue(0, 'Price must be at least 0'),
        v.maxValue(500000, 'Price must be at most 500000')
    ),
    category: v.pipe(
        v.enum(ProductCategory, 'Invalid product category')),
    stock: v.pipe(
        v.number(),
        v.minValue(0, 'Stock must be at least 0'),
        v.maxValue(100000, 'Stock must be at most 500000')),
    isActive: v.boolean(),
    images: v.pipe(
        v.array(
            v.string()
        ),
        v.minLength(1, 'At least one image is required'),
        v.maxLength(10, 'A maximum of 10 images is allowed'),
    )
  
});

export type productFormData = v.InferInput<typeof productFormSchema>;