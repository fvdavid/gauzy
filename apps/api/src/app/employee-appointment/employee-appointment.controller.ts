import { CrudController, IPagination } from '../core';
import { EmployeeAppointment } from './employee-appointment.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
	Controller,
	UseGuards,
	HttpStatus,
	Body,
	Param,
	Get,
	Post,
	Put,
	HttpCode,
	Query
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EmployeeAppointmentService } from './employee-appointment.service';
import { EmployeeAppointmentCreateCommand } from './commands/employee-appointment.create.command';
import { EmployeeAppointmentUpdateCommand } from './commands/employee-appointment.update.command';
import { AuthGuard } from '@nestjs/passport';
import { UUIDValidationPipe } from '../shared';
import { I18nLang } from 'nestjs-i18n';
import {
	LanguagesEnum,
	IEmployeeAppointmentCreateInput,
	IEmployeeAppointmentUpdateInput
} from '@gauzy/models';

@ApiTags('employee_appointment')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class EmployeeAppointmentController extends CrudController<
	EmployeeAppointment
> {
	constructor(
		private readonly employeeAppointmentService: EmployeeAppointmentService,
		private commandBus: CommandBus
	) {
		super(employeeAppointmentService);
	}

	@ApiOperation({
		summary: 'Find all employee appointments'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found employee appointments',
		type: EmployeeAppointment
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get()
	async findAllEmployeeAppointments(
		@Query('data') data: string
	): Promise<IPagination<EmployeeAppointment>> {
		const { relations, findInput } = JSON.parse(data);

		return this.employeeAppointmentService.findAllAppointments({
			where: findInput,
			relations
		});
	}

	@ApiOperation({ summary: 'Create new record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@Post('/create')
	async createEmployeeAppointment(
		@Body() entity: IEmployeeAppointmentCreateInput,
		@I18nLang() languageCode: LanguagesEnum,
		...options: any[]
	) {
		return this.commandBus.execute(
			new EmployeeAppointmentCreateCommand(entity, languageCode)
		);
	}

	@ApiOperation({ summary: 'Update an existing record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully edited.'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@Put(':id')
	async update(
		@Param('id') id: string,
		@Body() entity: IEmployeeAppointmentUpdateInput
	): Promise<any> {
		return this.commandBus.execute(
			new EmployeeAppointmentUpdateCommand(id, entity)
		);
	}

	@ApiOperation({ summary: 'Find Employee appointment by id.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found one record',
		type: EmployeeAppointment
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@UseGuards(AuthGuard('jwt'))
	@Get(':id')
	async findOneById(
		@Param('id', UUIDValidationPipe) id: string
	): Promise<EmployeeAppointment> {
		return this.employeeAppointmentService.findOne(id);
	}
}
