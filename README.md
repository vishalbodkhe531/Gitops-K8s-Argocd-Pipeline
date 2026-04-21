# Kubernetes + ArgoCD Setup Guide

A step-by-step guide to deploying ArgoCD on Kubernetes and setting up a CI/CD pipeline with GitHub Actions and Docker Hub.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [ArgoCD Installation](#argocd-installation)
- [Accessing the ArgoCD UI](#accessing-the-argocd-ui)
- [Exposing Your Application](#exposing-your-application)
- [CI/CD Pipeline with GitHub Actions](#cicd-pipeline-with-github-actions)

---

## Prerequisites

Before getting started, make sure you have a running Kubernetes cluster. You can use a local tool like [`kind`](https://kind.sigs.k8s.io/), [`minikube`](https://minikube.sigs.k8s.io/), or [`k3s`](https://k3s.io/), or a managed cloud provider such as GKE, EKS, or AKS.

Ensure `kubectl` is installed and configured to point to your cluster:

```bash
kubectl cluster-info
```

---

## ArgoCD Installation

### Step 1 — Create the ArgoCD namespace

Creates a dedicated namespace to isolate all ArgoCD resources from your application workloads.

```bash
kubectl create namespace argocd
```

### Step 2 — Install ArgoCD

Applies the official ArgoCD installation manifest from the stable release channel. This creates all necessary CRDs, deployments, services, and RBAC rules.

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Wait for all pods to be ready before proceeding:

```bash
kubectl get pods -n argocd -w
```

---

## Accessing the ArgoCD UI

### Step 3 — Port-forward the ArgoCD server

Forwards local port `8080` to the ArgoCD server's HTTPS port `443`. After running this command, open [https://localhost:8080](https://localhost:8080) in your browser.

```bash
kubectl port-forward service/argocd-server -n argocd 8080:443
```

### Step 4 — Retrieve the initial admin password

ArgoCD auto-generates an initial password for the `admin` user, stored as a Kubernetes secret.

**On Windows (PowerShell):**

```powershell
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | % { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

**On Linux / macOS:**

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

> **Note:** Log in with username `admin` and the password above. It is strongly recommended to change this password immediately after your first login via **User Info → Update Password** in the ArgoCD UI.

---

## Exposing Your Application

### Step 5 — Port-forward the application service

Once ArgoCD has deployed your application, expose it locally by forwarding port `8888` to the container's port `5000`. Visit [http://localhost:8888](http://localhost:8888) to access your running app.

```bash
kubectl port-forward service/argocd-pipeline 8888:5000
```

> Replace `argocd-pipeline` with the name of your actual Kubernetes service if it differs.

---

## CI/CD Pipeline with GitHub Actions

### Step 6 — Add the workflow folder

Create the GitHub Actions workflow directory in your repository if it does not already exist:

```bash
mkdir -p .github/workflows
```

Pull or sync the `.github/workflows/` folder from your repository to get the existing pipeline definitions.

### Step 7 — Configure the pipeline

Edit `.github/workflows/main.yml` to define your CI/CD steps. A typical pipeline includes:

1.  Checkout the source code
2.  Log in to Docker Hub
3.  Build and push the Docker image
4.  Trigger an ArgoCD sync (or rely on ArgoCD's automatic sync policy)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: your-dockerhub-username/your-image-name:latest
```

### Step 8 — Add Docker Hub credentials to GitHub secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add the following repository secrets:

| Secret name       | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `DOCKER_USERNAME` | Your Docker Hub username                              |
| `DOCKER_PASSWORD` | A Docker Hub access token (not your account password) |

> **Tip:** Generate a Docker Hub access token at [hub.docker.com](https://hub.docker.com) under **Account Settings → Security → New Access Token**. Using an access token instead of your real password is more secure and can be revoked independently.

---

## Quick Reference

| Command                                                     | Purpose                   |
| ----------------------------------------------------------- | ------------------------- |
| `kubectl create namespace argocd`                           | Create ArgoCD namespace   |
| `kubectl apply -n argocd -f <url>`                          | Install ArgoCD            |
| `kubectl get pods -n argocd -w`                             | Watch ArgoCD pods come up |
| `kubectl port-forward svc/argocd-server -n argocd 8080:443` | Access ArgoCD UI          |
| `kubectl port-forward svc/argocd-pipeline 8888:5000`        | Access your application   |

---

## Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub Access Tokens](https://docs.docker.com/security/for-developers/access-tokens/)
