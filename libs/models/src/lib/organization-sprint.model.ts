import { BaseEntityModel as IBaseEntityModel } from './base-entity.model';
import { OrganizationProjects, Task } from '@gauzy/models';
import { Organization } from '../../../../apps/api/src/app/organization/organization.entity';

export interface OrganizationSprint extends IBaseEntityModel {
	name: string;
	organization: Organization;
	goal?: string;
	length: number; // Duration of Sprint. Default value - 7 (days)
	startDate?: Date;
	endDate?: Date;
	dayStart?: number; // Enum ((Sunday-Saturday) => (0-7))
	project?: OrganizationProjects;
	isActive?: boolean;
	tasks?: Task[];
}

export enum SprintStartDayEnum {
	SUNDAY = 1,
	MONDAY = 2,
	TUESDAY = 3,
	WEDNESDAY = 4,
	THURSDAY = 5,
	FRIDAY = 6,
	SATURDAY = 7
}
