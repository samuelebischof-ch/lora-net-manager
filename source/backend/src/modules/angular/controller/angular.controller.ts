
import { Controller, Get, Res } from '@nestjs/common';

@Controller('app')
export class AngularController {

  @Get('*')
  root(@Res() res) {
    res.sendFile('/public/index.html', {root: __dirname });
  }
}