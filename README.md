# UD-GraphClustering
This demonstration is part of a student research project for visualizing and navigating graphical data on the web. This project will use a web-based data visualization framework to visualize knowledge graphs.

![click-clustering](https://github.com/VCityTeam/UD-GraphClustering/assets/129035607/e4fb0081-a476-46a1-8e4d-319e1f8526c4)

## Installation

The following sections detail how to setup the demo. In case of crash or error where the demo containers are down, it is possible that the data may need to be [reuploaded](#upload-rdf-store-dataset) to the blazegraph container.

### Pre-requisites 

* [Install Docker](https://docs.docker.com/engine/install/)

### Repository setup
Currently, the UD-Viz framework must be initialized after cloning this repository.
```
git clone https://github.com/VCityTeam/UD-GraphClustering.git
cd UD-GraphClustering
```

### Component Setup
To configure the demo and the components that support it, edit the `.env` file to be launched with docker-compose. By default, the following port are used by the following services:
- 8000: `UD-Viz`
- 9011: `Blazegraph`

The following sections will describe how to configure this file for each component. 

### Build Images and run containers
First, make sure to set the `sparqlModule/url` port in the `sparql_widget.json` file [here](./assets/config/widget/sparql_widget.json) to the same value as the `BLAZEGRAPH_PORT` variable declared in the [.env](./.env) file.

Then build the Blazegraph docker image and run its container:
```
docker compose up
```

### Upload RDF-Store Dataset
To upload files into the RDF-store to be used by the sparqlModule, you can use the online Blazegraph interface [here](http://localhost:9011/blazegraph/#update).

Make sure that you've uploaded the corresponding 3DTiles layer in the `3DTiles_temporal.json` file [here](./assets/config/layer/3DTiles_temporal.json) in order to visualize the 3D scene.

### Install and run the demo

To install the demo:
```bash
npm install
npm run build
```

To run the demo:

```bash
npm run host
```

Now the demo is ready and can be accessed from [localhost:8000](http://localhost:8000).

