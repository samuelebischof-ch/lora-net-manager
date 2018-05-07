
import { Controller, Get, Res } from '@nestjs/common';
import { ROOT_PATH } from '../../../ROOT_PATH';

@Controller('app')
export class AngularController {

  @Get('*')
  root(@Res() res) {
    res.sendFile('/public/index.html', {root: ROOT_PATH })
  }
}