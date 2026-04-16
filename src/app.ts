import express, { Request, Response } from "express";

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success-200",
    message: "Welcome to the Node.js GitOps CI/CD pipeline powered by ArgoCD",
    service: "nodejs-gitops-k8s-argocd-pipeline",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
