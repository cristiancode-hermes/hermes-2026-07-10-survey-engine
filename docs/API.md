# API Reference

## Base URL: `http://localhost:3000/api`
Swagger docs: `/api/docs`

## Authentication

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"John","email":"john@test.com","password":"password123"}'
# Response: { user: {...}, token: "jwt..." }
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@acme.com","password":"password123"}'
# Response: { user: {...}, token: "jwt..." }
```

## Surveys

### List Surveys
```bash
curl http://localhost:3000/api/surveys?status=active&page=1&limit=12 \
  -H 'Authorization: Bearer <token>'
```

### Create Survey
```bash
curl -X POST http://localhost:3000/api/surveys \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Customer Feedback","description":"Help us improve"}'
```

### Publish Survey
```bash
curl -X POST http://localhost:3000/api/surveys/<id>/publish \
  -H 'Authorization: Bearer <token>'
```

## Responses (Public)

### Get Public Survey
```bash
curl http://localhost:3000/api/survey/nps-anual-a1b2
```

### Submit Response
```bash
curl -X POST http://localhost:3000/api/surveys/<id>/responses \
  -H 'Content-Type: application/json' \
  -d '{"answers":[{"questionId":"q1","value":"Google"}]}'
```

## Results

### Get Results
```bash
curl http://localhost:3000/api/surveys/<id>/results \
  -H 'Authorization: Bearer <token>'
```
