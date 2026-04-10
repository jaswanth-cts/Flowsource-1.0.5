import { Controller, Get } from '@nestjs/common';
import { AppService } from '../service/app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';


@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('hello')
  @ApiOperation({ summary: 'Get Hello' })
  @ApiResponse({ status: 200})
  getHello() {
    return this.appService.getHello();
  }


  @Get('failure')
  @ApiOperation({ summary: 'Trigger Failure' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  failure() {
    return this.appService.failure();
  }

  @Get('ignore')
  @ApiOperation({ summary: 'Trigger Failure' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  ignoreException() {
    return this.appService.ignoreException();
  }

  @Get('slow')
  @ApiOperation({ summary: 'slow' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  slow() {
    return this.appService.slow();
  }
}
