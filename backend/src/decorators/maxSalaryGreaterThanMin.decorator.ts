import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MaxSalaryGreaterThanMin', async: false })
class MaxSalaryGreaterThanMinConstraint
  implements ValidatorConstraintInterface
{
  validate(maxSalary: any, args: ValidationArguments) {
    const dto = args.object as any;
    if (dto.minSalary == null || maxSalary == null) return true;
    return maxSalary >= dto.minSalary;
  }

  defaultMessage() {
    return 'maxSalary must be greater than or equal to minSalary.';
  }
}

export function MaxSalaryGreaterThanMin(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MaxSalaryGreaterThanMinConstraint,
    });
  };
}
