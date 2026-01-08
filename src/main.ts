import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AuthService } from './app/services/auth.service';

bootstrapApplication(AppComponent, appConfig).then(async (appRef) => {
  const auth = appRef.injector.get(AuthService);
  await auth.init();
}).catch((err) => console.error(err));
