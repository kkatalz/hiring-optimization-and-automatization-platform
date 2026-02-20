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

    if (dto.type === QuestionType.dropdown) {
      return (
        value !== undefined &&
        value !== null &&
        (Array.isArray(value) ? value.length > 0 : true)
      );
    }

    return true; // Valid if it's not a dropdown
  }

  defaultMessage() {
    return 'Answer options are required for dropdown questions.';
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
