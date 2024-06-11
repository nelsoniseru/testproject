This is a microservice app with nestjs prisma rabbitmq
* cd into membership-service && yarn install
* cd into register-service && yarn install
* in both membership-service &&  register-service run the command "npx prisma migrate dev  --name init" to  migrate the schema to the db
* make sure rabbitmq is installed and running
* in the membership-service run the command "npx ts-node prisma/seed.ts" to seed the package plan
* the env file for membership-service looks like

DATABASE_URL="postgresql://{username}:{password}@localhost:5432/{database_name}?schema=public"
SEND_GRID_API =
VERIFIED_EMAIL =

* the env file for register-service looks like

DATABASE_URL="postgresql://{username}:{password}@localhost:5432/{database_name}?schema=public"

* run the command "npx prisma studio" in any of the command prompt of membership-service || register-service
* start both app with command "yarn run start:dev" for development
postman url:https://documenter.getpostman.com/view/36241242/2sA3XMiNbg