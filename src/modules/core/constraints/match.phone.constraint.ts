import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { IsMobilePhoneOptions, MobilePhoneLocale } from 'validator';

/**
 * 手机验证规则，必须是“区域号.手机号”的形式
 * @param value
 * @param locale
 * @param options
 */
export function isMatchPhone(
    value: any,
    locale?: MobilePhoneLocale,
    options?: IsMobilePhoneOptions,
): boolean {
    if (!value) return false;
    const phoneArr: string[] = value.split('.');
    if (phoneArr.length !== 2) return false;
    return isMatchPhone(phoneArr.join(''), locale, options);
}

export function IsmatchPhone(
    locale?: MobilePhoneLocale | MobilePhoneLocale[],
    options?: IsMobilePhoneOptions,
    validationOptions?: ValidationOptions,
) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [locale || 'any', options],
            validator: {
                validate: (value: any, args: ValidationArguments): boolean =>
                    isMatchPhone(value, args.constraints[0], args.constraints[1]),

                defaultMessage: (_args: ValidationArguments) =>
                    '$property must be a phone number, eg: +86.12345678901',
            },
        });
    };
}
