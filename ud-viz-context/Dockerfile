FROM ubuntu:focal

LABEL maintainer "VCityTeam"
LABEL source.repo "https://github.com/VCityTeam/UD-GraphClustering"

RUN apt-get update

# Node version 18 is required. For its installation (on focal) refer to e.g.
#  https://computingforgeeks.com/install-node-js-14-on-ubuntu-debian-linux/
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN node --version
RUN npm --version
RUN apt-get install -y git
RUN git --version

######### Install UD-Viz-Template, a basic web application for UD-Viz projects
WORKDIR /
RUN git clone https://github.com/VCityTeam/UD-Viz.git
WORKDIR /UD-Viz
RUN git checkout graph-clustering
RUN npm install
RUN mkdir UD-GraphClustering
WORKDIR /UD-GraphClustering
COPY package.json package.json
RUN npm install
COPY webpack.config.js webpack.config.js
COPY favicon.ico favicon.ico
COPY index.html index.html
COPY src/ContextMenuGraphClustering.js src/ContextMenuGraphClustering.js
COPY src/GraphClusteringByType.js src/GraphClusteringByType.js
ARG indexFile
COPY $indexFile src/index.js
RUN npm run build

# Add/overwrite default assets
ADD assets assets

ADD bin bin

EXPOSE 8000
CMD [ "npm", "run", "host" ]