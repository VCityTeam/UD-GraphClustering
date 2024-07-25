import { loadJSON } from "@ud-viz/utils_browser";
import * as widgetSPARQL from '@ud-viz/widget_sparql';
import { ContextMenuGraphClustering } from "./ContextMenuGraphClustering";
import { GraphClusteringByType } from './GraphClusteringByType';

const config = {};
config.height = "1000";
config.width = "1500";
config.fontSize = 4;
config.fontFamily = "Arial";
config.strokeWidth = 0.75;
config.nodeSize = 7;
config.defaultColor = "#dedede";
config.linkColor = "#999";
config.nodeStrokeColor = "black";
config.fontSizeLegend = 15;

function formatResponseData(response, graph) {
  graph.links = response[0].links;
  graph.nodes = response[0].nodes;
  this.data.legend = [{type:'A' , color:'#FA8072'}, {type:'B' , color:'#BB27CA'}, {type:'C' , color:'#F7DC6F'}, {type:'D' , color:'#2874A6'}];
}

const d3Graph = new widgetSPARQL.D3GraphCanvas(
  config,
  undefined,
  formatResponseData
);

const typeClustering = new GraphClusteringByType(d3Graph);

loadJSON('./assets/jsonData/data_test_cycle.json').then((jsonResult) => {  
  d3Graph.init(jsonResult);
  typeClustering.init();
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
uiDomElement.appendChild(d3Graph.tooltipDiv);
uiDomElement.appendChild(dataView);
uiDomElement.style.backgroundColor = '#A7CFF3';

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