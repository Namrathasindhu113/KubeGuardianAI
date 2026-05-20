<div align="center">

# KubeGuardian AI

### AI-Powered Kubernetes Monitoring & Incident Analysis Platform

---

</div>

# Overview

KubeGuardian AI is a full-stack observability platform designed to monitor Kubernetes clusters, analyze pod failures using Large Language Models (LLMs), and provide intelligent incident diagnostics through a modern monitoring dashboard.

The platform combines Kubernetes observability, AI-driven log analysis, and real-time infrastructure monitoring to simplify debugging workflows for developers and DevOps engineers.

---

# Core Features

## Kubernetes Monitoring

- Real-time pod monitoring
- Namespace visibility
- Pod status tracking
- Failed pod detection

## AI Incident Analysis

- AI-powered Kubernetes log analysis
- Root cause identification
- Suggested remediation steps
- Severity classification

## Observability Dashboard

- CPU usage visualization
- Memory usage visualization
- Cluster health overview
- Real-time monitoring metrics

## Infrastructure & DevOps

- Dockerized services
- Kubernetes-native deployment
- REST API architecture
- Auto-refreshing dashboard

---

# System Architecture

```text
Kubernetes Cluster
        │
        ▼
Pod Logs & Metrics
        │
        ▼
FastAPI Backend
        │
        ▼
Groq LLM Analysis
        │
        ▼
React Monitoring Dashboard
```

---

# Technology Stack

## Frontend

- React
- Tailwind CSS
- Recharts
- Axios

## Backend

- FastAPI
- Kubernetes Python Client
- Groq API
- Python

## DevOps & Infrastructure

- Docker
- Kubernetes
- Minikube
- Prometheus
- Grafana

---

# Project Structure

```text
KubeGuardianAI/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── k8s/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
│
└── README.md
```

---

# Local Development Setup

## Clone Repository

```bash
git clone https://github.com/Namrathasindhu113/KubeGuardianAI.git

cd KubeGuardianAI
```

---

# Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Kubernetes Deployment

Apply Kubernetes manifests:

```bash
kubectl apply -f k8s/
```

Verify deployments:

```bash
kubectl get pods
```

```bash
kubectl get services
```

---

# Docker Support

## Backend

```bash
cd backend

docker build -t kubeguardian-backend .
```

## Frontend

```bash
cd frontend

docker build -t kubeguardian-frontend .
```

---

# Environment Variables

Create:

```text
backend/.env
```

Add:

```env
GROQ_API_KEY=your_api_key
```

---

# Future Enhancements

- Multi-cluster monitoring
- AI anomaly detection
- Historical incident tracking
- Predictive infrastructure alerts
- Slack/Discord integrations
- Role-based authentication

---

# Author

### Namratha Sindhu M

Focused on:
- AI Infrastructure
- Kubernetes
- Cloud Engineering
- DevOps
- Platform Engineering