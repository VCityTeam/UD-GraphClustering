import { loadJSON } from "@ud-viz/utils_browser";
import * as widgetSPARQL from '@ud-viz/widget_sparql';
import { ContextMenuGraphClustering } from "./ContextMenuGraphClustering";
import { GraphClusteringByType } from './GraphClusteringByType';

const config = {};
config.height = "1000";
config.width = "1500";
config.fontSize = 4;

function formatResponseData(response, graph) {
  graph.links = response[0].links.slice(0,500);
  for (const link of response[0].links.slice(0,500)){
    for(const property in link.data) {
        link[property] = link.data[property];
    }
    delete link['data'];
    graph.links.push(link);
    const source = response[0].nodes.find((element) => element.id == link.source);
    const target = response[0].nodes.find((element) => element.id == link.target);
    if (!graph.nodes.includes(source)){
      for(const property in source.data) {
        if (property != 'color')
          source[property] = source.data[property];
        else
          source.color_id = source.data[property];
      }
      delete source['data'];
      graph.nodes.push(source);
    }
    if (!graph.nodes.includes(target)){
      for(const property in target.data) {
        if (property != 'color')
          target[property] = target.data[property];
        else
          target.color_id = target.data[property];
      }
      delete target['data'];
      graph.nodes.push(target);
    }
  }
  console.log(graph);
}

const d3Graph = new widgetSPARQL.D3GraphCanvas(
  config,
  undefined,
  formatResponseData
);

const typeClustering = new GraphClusteringByType(d3Graph);

const button = document.createElement('button');
button.innerText = 'Stop the simulation';

loadJSON('./assets/jsonData/AIOLI-Teatime_01_07_24.json').then((jsonResult) => {  
  d3Graph.init(jsonResult);
  typeClustering.init();
  button.onclick = () => {
    console.log('stop');
    d3Graph.simulation.stop();
  };
});

const dataView = document.createElement('div');
dataView.append(d3Graph.canvas);
dataView.style['height'] = d3Graph.height + 'px';
dataView.style['width'] = d3Graph.width + 'px';


// Initialize the html context menu of the view
const contextMenu = new ContextMenuGraphClustering(d3Graph);

// Add UI
const uiDomElement = document.createElement('div');
uiDomElement.classList.add('full_screen');
document.body.appendChild(uiDomElement);
uiDomElement.appendChild(contextMenu.get());
uiDomElement.appendChild(typeClustering.get());
uiDomElement.appendChild(dataView);
uiDomElement.appendChild(d3Graph.tooltipDiv);
uiDomElement.style.backgroundColor = '#A7CFF3';
uiDomElement.appendChild(button);

// add listeners for D3Canvas node events. Three events are currently recognized 'click', 'mouseover', and 'mouseout'
d3Graph.addEventListener('click', (event) => {

  event.event.stopPropagation();

  const node = event.datum;
  console.debug('node clicked: ', node);

  if (node.display && node.realNode) {
    contextMenu.display(event, node);
  } else if (!node.realNode) {
    d3Graph.changeVisibilityChildren(node.id);
    d3Graph.removeNode(node.id);
    const element = document.getElementById(node.id);
    if (element) {
      element.checked = false;
    }
  }
});