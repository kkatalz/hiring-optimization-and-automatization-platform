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

    // Reject answerOptions when type is NOT dropdown
    if (value !== undefined && value !== null) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const dto = args.object as any;

    if (dto.type === QuestionType.dropdown) {
      return 'Answer options are required for dropdown questions.';
    }

    return 'Answer options are only allowed for dropdown questions. Remove answer options for non-dropdown question types.';
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
