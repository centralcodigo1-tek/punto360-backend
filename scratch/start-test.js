const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module.js');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
  console.log("Listening on 3001");
}
bootstrap();
