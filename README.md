# UD-GraphClustering
These demonstrations are part of a student research project for visualizing and navigating graphical data on the web. This project will use a web-based data visualization framework to visualize knowledge graphs.

![click-clustering](https://github.com/user-attachments/assets/2d7ce220-986a-428f-9221-98a61ac91e4d)

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

To install the demo:
```bash
npm install
npm run build
```

### Component Setup
To configure the demo and the components that support it, edit the `.env` file to be launched with docker-compose. By default, the following port are used by the following services:
- 9011: `Blazegraph`
- 9012 : `UD-Viz - demo sparql widget`
- 9013 : `UD-Viz - demo json data`

### Upload RDF-Store Dataset
To upload files into the RDF-store to be used by the sparqlModule, you can use the online Blazegraph interface [here](http://localhost:9011/blazegraph/#update).

Make sure that you've uploaded the corresponding 3DTiles layer in the `3DTiles_temporal.json` file [here](./assets/config/layer/3DTiles_temporal.json) in order to visualize the 3D scene.

### Build images, demos and run containers
First, make sure to set the `sparqlModule/url` port in the `sparql_widget.json` file [here](./assets/config/widget/sparql_widget.json) to the same value as the `BLAZEGRAPH_PORT` variable declared in the [.env](./.env) file.

Then build the Blazegraph docker image, build both demos and run their containers:
```
docker compose up
```
### Upload RDF-Store Dataset
To upload files into the RDF-store to be used by the sparqlModule, you can use the online Blazegraph interface [here](http://localhost:9011/blazegraph/#update).

Make sure that you've uploaded the corresponding 3DTiles layer in the `3DTiles_temporal.json` file [here](./assets/config/layer/3DTiles_temporal.json) in order to visualize the 3D scene.

Now the demo `UD-Viz - demo sparql widget` and  `UD-Viz - demo json data` are ready and can be accessed from [localhost:9012](http://localhost:9012) and [localhost:9013](http://localhost:9013).
