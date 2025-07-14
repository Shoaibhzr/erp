import { AbstractControl, ValidatorFn } from '@angular/forms';
export class EmailValidator {

    public static pattern(reg: RegExp) : ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            var value = <string>control.value;
            if(value)
            {
               return value.match(reg) ? null : { 'pattern': { value } };
            }
            else 
            {
                return null;
            }
        }
    }
}