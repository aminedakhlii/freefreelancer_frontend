# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.21.

## Environment setup

Environment files are not committed. After cloning, create them from the examples:

```bash
cp src/environments/environment.ts.example src/environments/environment.ts
cp src/environments/environment.prod.ts.example src/environments/environment.prod.ts
```

Then edit both files and set your **Firebase** config (Project Settings → General → Your apps: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId), plus `apiUrl` and (for prod) `siteUrl`. Auth uses Firebase Phone Sign-In only.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
