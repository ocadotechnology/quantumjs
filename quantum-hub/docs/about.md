# Rest Api

## Project management

*Projects can be created*
  POST /api/projects

*Projects can be listed*
  GET /api/projects

*A Project can be retrieved*
  GET /api/projects/:id

*Projects can have keys created*
  POST /api/projects/:id/new-key

*Projects can have keys revoked*
  DELETE /api/projects/:id/keys/:keyId

*Projects can have users added*
  POST /api/projects/:id/add-user

*Projects can have users removed*
  DELETE /api/projects/:id/users/:userId

*Projects can have their visibility set*
  PUT /api/projects/:id/public

Docs can be published to the hub as a zip (this stores the archive and builds the site)
  POST /api/projects/:id

Docs can be updated to be built with the latest builderVersion (this builds the site if the builderVersion is not up to date)
  POST /api/projects/:id/update

## User management

*The current user can be retrieved*
  GET /api/user

*User can create keys*
  POST /api/user/new-key

*User can revoke keys*
  DELETE /api/user/keys/:keyId

## File serving

Files can be got
  GET /docs/:projectId/*


# Storage

Entity storage
* The details for a project are stored under Project:<id>
  - { projectId, quantumJson, users, keys, builderVersion, buildId, buildLog, public }
* The details for a user are stored under User:<id>
  - { userId, keys, projects }

File storage
* The latest published archive is stored under /projects/:id
* The static files are stored under the buildId: /files/:buildId/*
