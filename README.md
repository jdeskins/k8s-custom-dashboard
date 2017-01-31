# k8s-custom-dashboard


## Proxy Kubernetes API Server

Clone this repository and build the project files.
Running the kubectl proxy command will run a proxy to the Kubernetes API server using
the credentials in ~/.kube/config file.

To use other credentials, set the Environment variable pointing to the credentials yaml file.
```
export KUBECONFIG=/path-to-config/kube.yaml
```

Now when running `kubectl` commands, it will use the credentials in the file provided in Environment variable.

## Run Dashboard Locally
This will build the necessary project files on your local machine.
The kubectl proxy command will start an internal server using the static dashboard files.

Clone this repo:
```
git clone https://github.com/jdeskins/k8s-custom-dashboard.git
cd k8s-custom-dashboard
```

Build the project files.
```
npm install
npm run build
kubectl proxy --www=.
``` 

Open browser to http://localhost:8001/static/ to see the custom dashboard.
