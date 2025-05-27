import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { StatusType } from 'src/association/entity';

@Injectable()
export class StatusTypeValidationPipe
    implements PipeTransform<string, StatusType | undefined>
{
    constructor(private readonly isRequired: boolean = true) {}

    transform(value: string | undefined): StatusType | undefined {
        if (!value && !this.isRequired) {
            return undefined;
        }

        if (
            !(
                value === StatusType.ACTIVE ||
                value === StatusType.WAITING ||
                value === StatusType.INACTIVE
            )
        ) {
            throw new BadRequestException('Invalid status type');
        }

        return value as StatusType;
    }
}
