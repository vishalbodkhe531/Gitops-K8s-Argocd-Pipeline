1] make clustor in kubernets 

-----------------------------------Argocd--------------------------------------------------

2] kubectl create namespace argocd

3] kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

4] kubectl port-forward service/argocd-server -n argocd 8080:443 

5] kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | % { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }

6] kubectl port-forward service/argocd-pipeline 8888:5000 -> we can run our application 

7] make pipeline using gitHub action and pull .github/workflows folder

8] add pipeline in main.yml file 

9] create token in docker and also set password and userName in gitHub action