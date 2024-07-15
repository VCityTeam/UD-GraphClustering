import { loadJSON } from "@ud-viz/utils_browser";
import * as widgetSPARQL from '@ud-viz/widget_sparql';
import { ContextMenuGraphClustering } from "./ContextMenuGraphClustering";

const config = {};
config.height = "1000";
config.width = "1500";
config.fontSize = 4;

function formatResponseData(response, graph) {
  graph.links = response[0].links.slice(0,50);
  for (const link of graph.links){
    const source = response[0].nodes.find((element) => element.id == link.source);
    const target = response[0].nodes.find((element) => element.id == link.target);
    if (!graph.nodes.includes(source)){
      source.color_id = source.data.color;
      source.type = source.data.type;
      graph.nodes.push(source);
    }
    if (!graph.nodes.includes(target)){
      target.color_id = target.data.color;
      target.type = target.data.type;
      graph.nodes.push(target);
    }
  }
  console.log(graph.nodes);
}

const d3Graph = new widgetSPARQL.D3GraphCanvas(
  config,
  undefined,
  formatResponseData
);

loadJSON('./assets/jsonData/AIOLI-Teatime_01_07_24.json').then((jsonResult) => {  
  d3Graph.init(jsonResult);
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
uiDomElement.appendChild(dataView);
uiDomElement.style.backgroundColor = 'grey';

// add listeners for D3Canvas node events. Three events are currently recognized 'click', 'mouseover', and 'mouseout'
d3Graph.addEventListener('click', (event) => {

  event.event.stopPropagation();

  const node = event.datum;
  console.debug('node clicked: ', node);

  if (node.display) {
    contextMenu.display(event, node);
  }
});