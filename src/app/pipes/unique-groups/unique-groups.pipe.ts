// unique-groups.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uniqueGroups'
})
export class UniqueGroupsPipe implements PipeTransform {
  transform(groups: any[]): any[] {
    if (!groups) return [];
    const seen = new Set();
    return groups.filter(group => {
      if (seen.has(group.name)) {
        return false;
      }
      seen.add(group.name);
      return true;
    });
  }
}
