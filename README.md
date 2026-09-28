# Spring Boot Microservices E-Commerce DevOps Project

A production-style **Spring Boot microservices e-commerce application** deployed on Kubernetes and automated with GitHub Actions, Amazon ECR, AWS IAM OIDC, and an AWS EC2 environment running Kind Kubernetes.

The project demonstrates a complete DevOps workflow:

```text
Developer
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    │ OIDC
    ▼
AWS IAM Role
    │
    ▼
Amazon ECR
    │
    ▼
AWS EC2
    │
    ▼
Kind Kubernetes Cluster
    │
    ├── API Gateway
    ├── Product Service
    ├── Order Service
    ├── Inventory Service
    ├── User Service
    ├── Email Service
    │
    ├── MongoDB
    ├── PostgreSQL
    ├── Kafka / Zookeeper
    │
    └── Elasticsearch / Logstash / Kibana / Filebeat
```

## Project Overview

The application is composed of independently deployable Spring Boot microservices.

The API Gateway provides the external API entry point and routes requests to the appropriate microservice. JWT-based authentication is applied to the protected application routes.

The infrastructure layer includes databases, Kafka messaging, and the Elastic Stack for centralized logging.

## Microservices

| Service | Responsibility | Port |
|---|---|---:|
| API Gateway | Request routing and authentication | 8090 |
| Product Service | Product management | 8080 |
| Order Service | Order processing | 8081 |
| Inventory Service | Inventory and stock management | 8082 |
| User Service | User registration and authentication | 8083 |
| Email Service | Email notifications | 8084 |

## Infrastructure

| Component | Purpose |
|---|---|
| MongoDB | Product-related NoSQL data |
| PostgreSQL | Relational data for application services |
| Kafka | Event streaming and asynchronous communication |
| Zookeeper | Kafka coordination |
| Elasticsearch | Log storage and indexing |
| Logstash | Log processing |
| Filebeat | Log collection |
| Kibana | Log visualization |

## Technology Stack

- Java 21
- Spring Boot
- Spring Cloud Gateway
- Spring Cloud OpenFeign
- Maven
- Docker
- Kubernetes
- Kind
- GitHub Actions
- AWS IAM
- GitHub OIDC
- Amazon ECR
- Amazon EC2
- PostgreSQL
- MongoDB
- Apache Kafka
- Elasticsearch
- Logstash
- Filebeat
- Kibana
- JWT

## Repository Structure

```text
E-commerce-project/
│
├── api-gateway/
├── product-service/
├── order-service/
├── inventory-service/
├── user-service/
├── email-service/
│
├── k8s/
│   ├── kind/
│   │   ├── create-kind-cluster.sh
│   │   └── kind-config.yaml
│   │
│   └── manifests/
│       ├── applications/
│       └── infrastructure/
│
├── assets/
│   ├── Architecture.png
│   └── Security.png
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
└── README.md
```

## Architecture

![System Architecture](assets/Architecture.png)

## Security Architecture

![Security Architecture](assets/Security.png)

## CI/CD Pipeline

The project uses GitHub Actions to automatically build and publish the microservice Docker images.

```text
Git Push
   │
   ▼
GitHub Actions
   │
   ├── Checkout source
   ├── Setup Java 21
   ├── Authenticate using GitHub OIDC
   │
   ▼
AWS IAM Role
   │
   ▼
Amazon ECR
   │
   ├── Build API Gateway image
   ├── Build Product Service image
   ├── Build Order Service image
   ├── Build Inventory Service image
   ├── Build User Service image
   └── Build Email Service image
```

The workflow uses **OIDC federation** instead of storing long-lived AWS access keys in GitHub.

## AWS Configuration

The deployment uses:

- Amazon EC2
- Amazon ECR
- AWS IAM
- GitHub Actions OIDC

The GitHub Actions workflow assumes an AWS IAM role using GitHub's OIDC identity token.

No AWS access keys are stored in the repository.

### ECR repositories

The six application images are stored in ECR:

```text
ecommerce/api-gateway
ecommerce/product-service
ecommerce/order-service
ecommerce/inventory-service
ecommerce/user-service
ecommerce/email-service
```

Images are tagged with both:

```text
<commit-sha>
latest
```

## Kubernetes Deployment

The application runs inside a Kind Kubernetes cluster on the EC2 instance.

Create the cluster:

```bash
./k8s/kind/create-kind-cluster.sh
```

Check the cluster:

```bash
kubectl get nodes
```

Check all workloads:

```bash
kubectl get pods
```

Check services:

```bash
kubectl get svc
```

## Pulling Images from Amazon ECR

The Kubernetes cluster uses an image pull secret to authenticate against private ECR.

Create the secret:

```bash
kubectl create secret docker-registry ecr-registry-secret \
  --docker-server=<AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com \
  --docker-username=AWS \
  --docker-password="$(aws ecr get-login-password --region <AWS_REGION>)"
```

The application manifests reference ECR images:

```yaml
image: <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/ecommerce/product-service:latest
imagePullPolicy: Always
```

and use:

```yaml
imagePullSecrets:
  - name: ecr-registry-secret
```

## Deploy Infrastructure

Infrastructure manifests are stored under:

```text
k8s/manifests/infrastructure/
```

Deploy them with:

```bash
kubectl apply -f k8s/manifests/infrastructure/
```

## Deploy Microservices

Application manifests are stored under:

```text
k8s/manifests/applications/
```

Deploy them with:

```bash
kubectl apply -f k8s/manifests/applications/
```

Verify:

```bash
kubectl get pods
```

All application services should eventually report:

```text
1/1 Running
```

## API Gateway

The API Gateway runs on port `8090` inside its pod.

Its Kubernetes Service exposes:

```text
Service Port: 80
Target Port: 8090
```

The service is configured as a NodePort for EC2 access:

```text
80:30931
```

The NodePort is reachable from the Kind node:

```text
172.18.0.2:30931
```

## External Access Through Nginx

Nginx runs on the EC2 host and acts as a reverse proxy.

```text
Internet
   │
   ▼
EC2 :8080
   │
   ▼
Nginx
   │
   ▼
Kind Node :30931
   │
   ▼
API Gateway :8090
```

Nginx configuration forwards requests to:

```text
172.18.0.2:30931
```

The application can therefore be accessed through:

```text
http://<EC2_PUBLIC_IP>:8080
```

## API Routes

The API Gateway defines the following application routes:

```text
/ecomapi/products/**
/ecomapi/orders/**
/ecomapi/inventory/**
/ecomapi/auth/**
```

The protected application routes require JWT authentication.

For example:

```bash
curl -i http://localhost:8080/ecomapi/products
```

Without a valid JWT, the expected response is:

```text
HTTP/1.1 401 Unauthorized
```

This confirms that the request successfully reached the API Gateway and was processed by the authentication filter.

The root URL:

```text
/
```

does not have an application route and therefore returns:

```text
404 Not Found
```

This is expected behavior for the current backend-only project.

## Swagger / API Documentation

The project uses Springdoc/OpenAPI.

Individual services expose API documentation, and the Gateway contains aggregation routes such as:

```text
/aggregate/product-service/v3/api-docs
/aggregate/order-service/v3/api-docs
/aggregate/inventory-service/v3/api-docs
/aggregate/user-service/v3/api-docs
```

## Monitoring and Logging

The project uses the Elastic Stack:

```text
Application Pods
      │
      ▼
   Filebeat
      │
      ▼
   Logstash
      │
      ▼
 Elasticsearch
      │
      ▼
    Kibana
```

Check the logging components:

```bash
kubectl get pods | grep -E "filebeat|logstash|elasticsearch|kibana"
```

Kibana can be accessed through Kubernetes port forwarding when required:

```bash
kubectl port-forward svc/kibana 5601:5601
```

Then open:

```text
http://localhost:5601
```

## Useful Kubernetes Commands

View all pods:

```bash
kubectl get pods
```

View services:

```bash
kubectl get svc
```

View deployments:

```bash
kubectl get deployments
```

View application logs:

```bash
kubectl logs deployment/api-gateway
```

Describe a pod:

```bash
kubectl describe pod <pod-name>
```

Check API Gateway endpoints:

```bash
kubectl get endpoints api-gateway
```

Check NodePort:

```bash
kubectl get svc api-gateway
```

## Security Notes

Never commit:

- AWS access keys
- AWS secret keys
- GitHub tokens
- JWT secrets
- Database passwords
- SMTP passwords
- API keys
- Private certificates

Use AWS IAM roles and GitHub OIDC rather than long-lived AWS credentials wherever possible.

Sensitive configuration should be supplied through environment variables, Kubernetes Secrets, AWS Secrets Manager, or another appropriate secret-management mechanism.

## Current Deployment Model

The current portfolio deployment demonstrates:

```text
Source Code
    ↓
GitHub
    ↓
GitHub Actions
    ↓
GitHub OIDC
    ↓
AWS IAM
    ↓
Amazon ECR
    ↓
EC2
    ↓
Docker
    ↓
Kind Kubernetes
    ↓
Microservices
    ↓
Nginx
    ↓
External API Access
```

## Project Status

The application microservices and Kubernetes infrastructure are deployed and running on the EC2-based Kind cluster.

The CI/CD pipeline successfully authenticates GitHub Actions to AWS through OIDC and pushes application images to Amazon ECR.

The Kubernetes workloads pull the application images from private ECR repositories.

Email delivery through an external SMTP provider is not required for the core deployment demonstration.

## Author

**Pavan Motupalli**

DevOps / Cloud / Kubernetes portfolio project.
