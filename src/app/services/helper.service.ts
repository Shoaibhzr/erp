import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  public toCamelCase(o: any): any {

    var newO: any, origKey: any, newKey: any, value: any;

    if (o instanceof Array) {

      return o.map((value) => {

        if (typeof value === "object") {

          value = this.toCamelCase(value);

        }

        return value;

      });

    }
    else {

      newO = {};

      for (origKey in o) {

        if (o.hasOwnProperty(origKey)) {

          newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString();

          value = o[origKey];

          if (value instanceof Array || (value !== null && value.constructor === Object)) {

            value = this.toCamelCase(value)

          }

          newO[newKey] = value

        }

      }

    }

    return newO

  }

}
