import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { QuestionType } from '../entities/question.enum';

@ValidatorConstraint({ name: 'RequiredIfDropdown', async: false })
class RequiredIfDropdownConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const dto = args.object as any;
    const isDropdown = dto.type === QuestionType.dropdown;

    // If it IS a dropdown: value must be a non-empty array
    if (isDropdown) {
      return Array.isArray(value) && value.length > 0;
    }

    // If it is NOT a dropdown: value must be undefined, null or an empty array.
    return (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0)
    );
  }

  defaultMessage(args: ValidationArguments) {
    const dto = args.object as any;
    return dto.type === QuestionType.dropdown
      ? 'Answer options are required and cannot be empty for dropdown questions.'
      : 'Answer options must be removed for non-dropdown question types.';
  }
}

export function RequiredIfDropdown(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: RequiredIfDropdownConstraint,
    });
  };
}
