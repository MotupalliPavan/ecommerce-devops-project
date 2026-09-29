# E-Commerce Microservices — DevOps & Kubernetes Project

A production-style e-commerce application built with **Spring Boot microservices** and a **React frontend**, containerized with Docker and deployed to Kubernetes on an AWS EC2 instance.

The project demonstrates a complete DevOps workflow:

**GitHub → GitHub Actions → AWS IAM/OIDC → Amazon ECR → AWS Systems Manager → EC2 → Kubernetes**

---

## 🚀 Project Overview

This project is a microservices-based e-commerce platform consisting of:

- React frontend
- API Gateway
- User Service
- Product Service
- Inventory Service
- Order Service
- Email Service
- MongoDB
- PostgreSQL databases
- Apache Kafka
- Zookeeper
- Elasticsearch
- Logstash
- Kibana
- Filebeat

The application is containerized using Docker and deployed to a Kubernetes cluster running with **Kind** on an AWS EC2 instance.

The CI/CD pipeline automatically builds Docker images, pushes them to Amazon ECR, and deploys the new version to Kubernetes using AWS Systems Manager.

---

## 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │      Developer       │
                         │                      │
                         │      git push        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       GitHub         │
                         │      Repository      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   GitHub Actions     │
                         │                      │
                         │  Build + Test        │
                         │  Docker Build        │
                         │  ECR Push            │
                         └──────────┬───────────┘
                                    │
                              GitHub OIDC
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       AWS IAM        │
                         │                      │
                         │ GitHub Actions Role  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Amazon ECR       │
                         │                      │
                         │ Immutable SHA Images │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      AWS SSM         │
                         │    Run Command       │
                         └──────────┬───────────┘
                                    │
                                    ▼
              ┌─────────────────────────────────────────┐
              │                AWS EC2                   │
              │                                          │
              │  Ubuntu + Docker + Kind + kubectl       │
              │                                          │
              │       ┌────────────────────────┐         │
              │       │   Kubernetes / Kind    │         │
              │       │                        │         │
              │       │  API Gateway           │         │
              │       │  User Service          │         │
              │       │  Product Service       │         │
              │       │  Inventory Service     │         │
              │       │  Order Service         │         │
              │       │  Email Service         │         │
              │       │  React Frontend        │         │
              │       │                        │         │
              │       │  MongoDB               │         │
              │       │  PostgreSQL            │         │
              │       │  Kafka                 │         │
              │       │  Zookeeper             │         │
              │       │                        │         │
              │       │  ELK + Filebeat        │         │
              │       └────────────────────────┘         │
              └─────────────────────────────────────────┘
```

---

# 🧩 Microservices

| Service | Technology | Purpose |
|---|---|---|
| API Gateway | Spring Boot | Routes client requests |
| User Service | Spring Boot | User registration and authentication |
| Product Service | Spring Boot | Product management |
| Inventory Service | Spring Boot | Inventory management |
| Order Service | Spring Boot | Order processing |
| Email Service | Spring Boot | Email-related operations |
| Frontend | React + Vite | User interface |

---

# 🗄️ Infrastructure

| Component | Purpose |
|---|---|
| MongoDB | Product/service data |
| PostgreSQL | User, order and inventory databases |
| Kafka | Event/message streaming |
| Zookeeper | Kafka coordination |
| Elasticsearch | Log/data search |
| Logstash | Log processing |
| Kibana | Log visualization |
| Filebeat | Log collection |
| Kubernetes | Container orchestration |
| Kind | Kubernetes cluster running on EC2 |

---

# ☁️ AWS Services

The project uses the following AWS services:

### Amazon EC2

Hosts the Kubernetes environment.

The EC2 instance runs:

- Ubuntu
- Docker
- Kind
- kubectl
- AWS Systems Manager Agent

### Amazon ECR

Stores Docker images for:

```text
ecommerce/api-gateway
ecommerce/email-service
ecommerce/inventory-service
ecommerce/order-service
ecommerce/product-service
ecommerce/user-service
ecommerce/frontend
```

### AWS IAM

Used for secure authentication and authorization.

Two important roles are used:

```text
GitHubActions-EcommerceProject
EcommerceEC2-SSM-Role
```

### GitHub OIDC

GitHub Actions authenticates with AWS using OpenID Connect instead of storing long-lived AWS access keys inside GitHub.

The workflow uses:

```text
GitHub Actions
      ↓
OIDC Token
      ↓
AWS STS
      ↓
IAM Role
      ↓
Temporary AWS Credentials
```

### AWS Systems Manager

AWS SSM Run Command is used by GitHub Actions to remotely execute the Kubernetes deployment commands on the EC2 instance.

This avoids exposing SSH credentials to the CI/CD pipeline.

---

# 🔄 CI/CD Pipeline

Every push to the `main` branch triggers the GitHub Actions workflow.

```text
Developer
    │
    │ git push
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Checkout source code
    │
    ├── Setup Java 21
    │
    ├── Authenticate to AWS using OIDC
    │
    ├── Authenticate with Amazon ECR
    │
    ├── Build Spring Boot services
    │
    ├── Build Docker images
    │
    ├── Push images to ECR
    │
    ├── Setup Node.js
    │
    ├── Build React frontend
    │
    ├── Build frontend Docker image
    │
    ├── Push frontend image to ECR
    │
    ▼
AWS SSM
    │
    ▼
EC2
    │
    ▼
Kind Kubernetes
    │
    ├── Update deployments
    │
    └── Wait for rollout
    │
    ▼
New application version
```

---

# 🏷️ Immutable Docker Image Tags

Docker images are tagged using the Git commit SHA.

Example:

```text
289984444906.dkr.ecr.us-east-1.amazonaws.com/ecommerce/frontend:8bb9e6b1127f154e8a27d7324483bb610e877132
```

This provides traceability between:

```text
Git Commit
     ↓
Docker Image
     ↓
ECR
     ↓
Kubernetes Deployment
     ↓
Running Pod
```

For example:

```text
Git commit:
8bb9e6b1127f154e8a27d7324483bb610e877132

ECR image:
frontend:8bb9e6b1127f154e8a27d7324483bb610e877132

Kubernetes:
frontend:8bb9e6b1127f154e8a27d7324483bb610e877132
```

This makes deployments reproducible and allows a specific version to be identified easily.

---

# 📁 Project Structure

```text
E-commerce-project/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── api-gateway/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── email-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── inventory-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── order-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── product-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── user-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── k8s/
│   ├── kind/
│   │   ├── create-kind-cluster.sh
│   │   └── kind-config.yaml
│   │
│   └── manifests/
│       ├── applications/
│       │   ├── api-gateway.yaml
│       │   ├── email-service.yaml
│       │   ├── frontend-deployment.yaml
│       │   ├── frontend-service.yaml
│       │   ├── inventory-service.yaml
│       │   ├── order-service.yaml
│       │   ├── product-service.yaml
│       │   └── user-service.yaml
│       │
│       └── infrastructure/
│           ├── elasticsearch.yaml
│           ├── filebeat.yaml
│           ├── kafka.yaml
│           ├── kibana.yaml
│           ├── logstash.yaml
│           ├── mongodb.yaml
│           ├── postgres-*.yaml
│           └── zookeeper.yaml
│
├── filebeat/
├── logstash/
│   └── pipeline/
│
├── docker-compose.yml
└── README.md
```

---

# 🐳 Running Locally

## Prerequisites

Install:

- Java 21
- Maven
- Node.js 22
- Docker
- kubectl
- Kind
- Git

Clone the repository:

```bash
git clone https://github.com/MotupalliPavan/ecommerce-devops-project.git
cd ecommerce-devops-project
```

---

# ☸️ Kubernetes Cluster

Create the Kind cluster:

```bash
cd k8s/kind
./create-kind-cluster.sh
```

Verify:

```bash
kubectl get nodes
```

Expected:

```text
NAME                          STATUS
microservices-control-plane   Ready
```

---

# 🚀 Deploy Kubernetes Resources

Infrastructure manifests are located under:

```text
k8s/manifests/infrastructure/
```

Application manifests are located under:

```text
k8s/manifests/applications/
```

Apply the required manifests with:

```bash
kubectl apply -f k8s/manifests/infrastructure/
```

Then:

```bash
kubectl apply -f k8s/manifests/applications/
```

Check pods:

```bash
kubectl get pods
```

Check deployments:

```bash
kubectl get deployments
```

---

# 🔐 Amazon ECR Authentication

The Kubernetes cluster uses an ECR registry secret for pulling private images.

Example:

```bash
kubectl create secret docker-registry ecr-registry-secret \
  --docker-server=289984444906.dkr.ecr.us-east-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password="$(aws ecr get-login-password --region us-east-1)"
```

The Kubernetes deployments reference this secret through:

```yaml
imagePullSecrets:
  - name: ecr-registry-secret
```

> ECR authentication tokens are temporary and need to be refreshed periodically.

---

# 🔧 Useful Kubernetes Commands

Check all pods:

```bash
kubectl get pods
```

Check deployments:

```bash
kubectl get deployments
```

Check services:

```bash
kubectl get services
```

Check a specific deployment:

```bash
kubectl describe deployment frontend
```

Check logs:

```bash
kubectl logs deployment/frontend
```

Check the image currently configured:

```bash
kubectl get deployment frontend \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
echo
```

Check rollout:

```bash
kubectl rollout status deployment/frontend
```

---

# 🔁 Rolling Deployment

The CD pipeline updates each Kubernetes deployment using:

```bash
kubectl set image deployment/<service>
```

Then verifies the rollout:

```bash
kubectl rollout status deployment/<service> --timeout=180s
```

The pipeline fails if a rollout does not complete successfully.

This prevents GitHub Actions from reporting a successful deployment when Kubernetes is unable to complete the update.

---

# 🔙 Rollback

Kubernetes maintains deployment revision history.

View revisions:

```bash
kubectl rollout history deployment/frontend
```

Rollback:

```bash
kubectl rollout undo deployment/frontend
```

Check the rollout:

```bash
kubectl rollout status deployment/frontend
```

---

# 📊 Observability

The project includes an ELK-based logging stack:

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

Components:

- Filebeat — collects logs
- Logstash — processes logs
- Elasticsearch — stores/searches logs
- Kibana — visualizes logs

---

# 🌐 Frontend

The React frontend is built using Vite and served using Nginx.

Frontend API requests use:

```text
/ecomapi/
```

Nginx forwards these requests to the API Gateway.

```text
Browser
   │
   ▼
Frontend Nginx
   │
   │ /ecomapi/
   ▼
API Gateway
   │
   ├── User Service
   ├── Product Service
   ├── Inventory Service
   └── Order Service
```

---

# 🔒 Security

The project uses several security practices:

### GitHub → AWS

No long-lived AWS access keys are stored in GitHub Actions.

GitHub Actions uses:

```text
GitHub OIDC
     ↓
AWS STS
     ↓
IAM Role
```

### AWS SSM

Deployment commands are executed through AWS Systems Manager instead of storing SSH credentials in the CI/CD pipeline.

### Secrets

Application secrets should be supplied through Kubernetes Secrets, environment variables, or a dedicated secrets-management solution.

**Never commit real credentials, passwords, API keys, or tokens to Git.**

---

# 🧪 CI/CD Verification

A successful deployment can be verified using:

```bash
kubectl get pods
```

Example:

```text
NAME                              READY   STATUS
api-gateway-xxxxx                 1/1     Running
email-service-xxxxx               1/1     Running
frontend-xxxxx                    1/1     Running
inventory-service-xxxxx           1/1     Running
order-service-xxxxx               1/1     Running
product-service-xxxxx             1/1     Running
user-service-xxxxx                1/1     Running
```

Verify the deployed frontend image:

```bash
kubectl get deployment frontend \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
echo
```

Example:

```text
289984444906.dkr.ecr.us-east-1.amazonaws.com/ecommerce/frontend:8bb9e6b1127f154e8a27d7324483bb610e877132
```

This confirms that Kubernetes is running the image corresponding to the Git commit.

---

# 📌 DevOps Concepts Demonstrated

This project demonstrates practical experience with:

- Linux
- Git
- GitHub
- GitHub Actions
- CI/CD
- Docker
- Docker image versioning
- Amazon ECR
- AWS IAM
- GitHub OIDC
- AWS STS
- AWS Systems Manager
- Amazon EC2
- Kubernetes
- Kind
- kubectl
- Kubernetes Deployments
- Kubernetes Services
- Kubernetes Secrets
- Rolling deployments
- Rollbacks
- Microservices
- Spring Boot
- React
- Nginx
- MongoDB
- PostgreSQL
- Apache Kafka
- Zookeeper
- Elasticsearch
- Logstash
- Kibana
- Filebeat

---

# 🎯 Deployment Flow

The complete deployment process is:

```text
1. Developer modifies code
          ↓
2. git push origin main
          ↓
3. GitHub Actions starts
          ↓
4. GitHub authenticates to AWS using OIDC
          ↓
5. Maven builds Spring Boot services
          ↓
6. Docker images are created
          ↓
7. Images are tagged with Git SHA
          ↓
8. Images are pushed to Amazon ECR
          ↓
9. React frontend is built
          ↓
10. Frontend image is pushed to ECR
          ↓
11. GitHub Actions calls AWS SSM
          ↓
12. SSM executes deployment on EC2
          ↓
13. kubectl updates Kubernetes deployments
          ↓
14. Kubernetes performs rolling updates
          ↓
15. rollout status verifies deployment
          ↓
16. New application version becomes available
```

---

# 🏆 Project Result

The project demonstrates a complete automated DevOps workflow from source-code change to a running Kubernetes application.

A simple frontend change can travel through the complete pipeline:

```text
Code Change
    ↓
GitHub
    ↓
GitHub Actions
    ↓
AWS OIDC
    ↓
Amazon ECR
    ↓
AWS SSM
    ↓
EC2
    ↓
Kind Kubernetes
    ↓
Rolling Deployment
    ↓
Running Application
```

The deployment is traceable using Git commit SHA tags, allowing the running Kubernetes workload to be associated with the exact source-code version that produced the Docker image.

---

## 👨‍💻 Author

**Pavan Motupalli**

DevOps / Cloud / Kubernetes Project

GitHub:

https://github.com/MotupalliPavan/ecommerce-devops-project
