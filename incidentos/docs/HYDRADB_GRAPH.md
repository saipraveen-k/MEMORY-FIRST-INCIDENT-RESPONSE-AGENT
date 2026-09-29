# HydraDB Graph Knowledge Architecture

## 1. Overview
HydraDB provides structured graph relationships for IncidentOS. Operating over SlateDB storage with OpenCypher query support, HydraDB tracks microservice topology, deployment histories, root cause patterns, and past incident relationships.

## 2. Graph Schema & Node Entities

```cypher
(:Incident)
(:Service)
(:Deployment)
(:RootCause)
(:Action)
(:Engineer)
(:Lesson)
```

### Supported Relationships:
- `(:Incident)-[:AFFECTS]->(:Service)`
- `(:Incident)-[:CAUSED_BY]->(:RootCause)`
- `(:Incident)-[:FOLLOWED_DEPLOYMENT]->(:Deployment)`
- `(:Incident)-[:RESOLVED_BY]->(:Action)`
- `(:Incident)-[:FAILED_ACTION]->(:Action)`
- `(:Incident)-[:SIMILAR_TO]->(:Incident)`
- `(:Incident)-[:GENERATED_LESSON]->(:Lesson)`
- `(:Service)-[:DEPENDS_ON]->(:Service)`
- `(:Engineer)-[:HANDLED]->(:Incident)`
- `(:Deployment)-[:CHANGED]->(:Service)`

## 3. Sample Cypher Queries

### Service Dependency Query:
```cypher
MATCH (s:Service {id: 'payments-api'})-[:DEPENDS_ON]->(dep:Service)
RETURN dep.id AS dependency_service
```

### Historical Root Cause Pattern Query:
```cypher
MATCH (inc:Incident)-[:CAUSED_BY]->(rc:RootCause)
WHERE inc.service = 'payments-api'
RETURN rc.name AS root_cause, count(inc) AS frequency
ORDER BY frequency DESC
```
