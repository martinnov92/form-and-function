import {
    CreateValidator,
    FieldResult,
    CovalidatedFieldResult,
    MessageParams,
    Reporters,
    ValidFieldResult,
    InvalidFieldResult,
    isValidResult,
    isInvalidResult,
    CreateValidatorOptions,
    ValidationResult
} from "./typesAndGuards";
import { FieldValue, FieldMap } from "../Form";
import { FieldMeta, FieldRecordAny } from "../Field";

/**
 * Combines validators so that at least one must be valid
 * @param validators Validators to combine
 * @param combiner How to combine error messages
 */
export const any = <T, U>(
    validators: Array<CreateValidator<ValidationResult, T, U>>,
    combiner?: (errors: string[]) => string
) => (
    reporters: Reporters,
    options: CreateValidatorOptions<U, MessageParams<FieldValue, any>>
) => async (
    val: T,
    fields: FieldMap
): Promise<FieldResult | CovalidatedFieldResult> => {
    const results = await Promise.all(
        validators.map(validator => validator(reporters, options)(val, fields))
    );

    if (results.some(isValidResult)) {
        return reporters.valid();
    }

    const errors = results.filter(isInvalidResult).map(r => r.error);

    return reporters.invalid(combiner ? combiner(errors) : errors.join(" or "));
};
