import * as v from "valibot";
import { CURRENCIES } from "../types";

export const profileSchema = v.object({
    firstName: v.pipe(
        v.string('First name is required'),
        v.nonEmpty('First name is required'),
        v.trim(),
        v.maxLength(100, 'First name cannot exceed 100 characters'),
        v.regex(/^[\p{L}\s'-]+$/u, 'First name contains invalid characters')
    ),

    // Last name validation - matches backend exactly
    lastName: v.pipe(
        v.string('Last name is required'),
        v.nonEmpty('Last name is required'),
        v.trim(),
        v.maxLength(100, 'Last name cannot exceed 100 characters'),
        v.regex(/^[\p{L}\s'-]+$/u, 'Last name contains invalid characters')
    ),

    // Phone number validation - optional, matches backend when provided
    phoneNumber: v.optional(
        v.pipe(
            v.string(),
            v.trim(),
            v.maxLength(20, 'Phone number cannot exceed 20 characters'),
            v.regex(/^\+?[1-9]\d{1,14}$/, 'Phone number format is invalid')
        )
    ),

    dateOfBirth: v.optional(
        v.pipe(
            v.date('Invalid date format'),
            v.check((date) => {
                const today = new Date();
                const age = today.getFullYear() - date.getFullYear();
                const monthDiff = today.getMonth() - date.getMonth();
                const dayDiff = today.getDate() - date.getDate();

                const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
                return actualAge >= 13;
            }, 'You must be at least 13 years old')
        )
    ),


    // Preferred currency validation - optional, matches backend
    preferredCurrency: v.optional(
        v.picklist(CURRENCIES, "Please select a valid currency")
    ),

})

export type ProfileFormData = v.InferInput<typeof profileSchema>;