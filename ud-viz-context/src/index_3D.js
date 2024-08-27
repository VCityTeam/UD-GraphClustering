import * as proj4 from 'proj4';
import * as itowns from 'itowns';
import * as THREE from 'three';
import * as d3 from 'd3';
import * as extensions3DTilesTemporal from '@ud-viz/extensions_3d_tiles_temporal';
import {
  loadMultipleJSON,
  initScene,
  getUriLocalname,
  fetchC3DTileFeatureWithNodeText,
  focusCameraOn
} from "@ud-viz/utils_browser";
import * as widgetSPARQL from '@ud-viz/widget_sparql';
import { ContextMenuGraphClustering } from "./ContextMenuGraphClustering";


loadMultipleJSON([
    './assets/config/extents.json',
    './assets/config/crs.json',
    './assets/config/layer/3DTiles_temporal.json',
    './assets/config/widget/sparql_widget.json',
    './assets/config/server/sparql_server.json',
  ])
  .then((configs) => {
    proj4.default.defs(
      configs['crs'][0].name,
      configs['crs'][0].transform
    );

    const extent = new itowns.Extent(
      configs['extents'][0].name,
      parseInt(configs['extents'][0].west),
      parseInt(configs['extents'][0].east),
      parseInt(configs['extents'][0].south),
      parseInt(configs['extents'][0].north)
    );

    // create a itowns planar view
    const viewDomElement = document.createElement('div');
    viewDomElement.classList.add('full_screen');
    document.body.appendChild(viewDomElement);
    const view = new itowns.PlanarView(viewDomElement, extent);

    // init scene 3D
    initScene(
      view.camera.camera3D,
      view.mainLoop.gfxEngine.renderer,
      view.scene
    );

    const style = new itowns.Style({
      fill: {
        color: function (feature) {
          return feature.userData.selectedColor
            ? feature.userData.selectedColor
            : 'white';
        },
      },
    });

    // add a 3DTiles temporal layer
    const extensions = new itowns.C3DTExtensions();
    extensions.registerExtension(extensions3DTilesTemporal.ID, {
      [itowns.C3DTilesTypes.batchtable]:
        extensions3DTilesTemporal.C3DTTemporalBatchTable,
      [itowns.C3DTilesTypes.boundingVolume]:
        extensions3DTilesTemporal.C3DTTemporalBoundingVolume,
      [itowns.C3DTilesTypes.tileset]:
        extensions3DTilesTemporal.C3DTTemporalTileset,
    });

    configs['3DTiles_temporal'].forEach((layerConfig) => {
      const c3DTilesLayer = new itowns.C3DTilesLayer(
        layerConfig.id,
        {
          style: style,
          name: layerConfig.id,
          source: new itowns.C3DTilesSource({
            url: layerConfig.url,
          }),
          registeredExtensions: extensions,
        },
        view
      );

      itowns.View.prototype.addLayer.call(view, c3DTilesLayer);
    });

     // //// SPARQL MODULE

    let hiddenGroup = undefined;

    const handleZoom = (ev, graph) => {
      const getMaxiGroup = (graph) => {
        let max = 0;
        graph.data.nodes.forEach((elem) => {
          if (elem.group > max) max = elem.group;
        });
        return max;
      };
      d3.selectAll('g.graph')
        .attr('height', '100%')
        .attr('width', '100%')
        .attr(
          'transform',
          'translate(' +
            ev.transform.x +
            ',' +
            ev.transform.y +
            ') scale(' +
            ev.transform.k +
            ')'
        );
      // zoom clustering by group
      if (zoomCheckBox.checked) {
        if (
          Math.floor(ev.transform.k / zoom.value) !=
            hiddenGroup &&
          Math.floor(ev.transform.k) >= zoom.value
        ) {
          graph.changeVisibilityChildren('zoom');
          graph.removeNode('zoom');
          let clusteredNodes = [];
          const maxGroup = getMaxiGroup(graph);
          for (let i = Math.floor(ev.transform.k / zoom.value) ; i <= maxGroup ; i++) {
            clusteredNodes = clusteredNodes.concat(graph.getNodeByGroup(i));
          }
          const node = graph.createNewCluster(
            'zoom',
            clusteredNodes
          );
          node.display = false;
          hiddenGroup = Math.floor(
            ev.transform.k / zoom.value
          );
          graph.update();
        }
      }
    };

    const sparqlWidget = new widgetSPARQL.SparqlQueryWindow(
      new widgetSPARQL.SparqlEndpointResponseProvider(
        configs['sparql_server']
      ),
      configs['sparql_widget'],
      handleZoom
    );
    sparqlWidget.domElement.classList.add('widget_sparql');

    const contextMenu = new ContextMenuGraphClustering(sparqlWidget.d3Graph);

    // Add UI
    const uiDomElement = document.createElement('div');
    uiDomElement.classList.add('full_screen');
    document.body.appendChild(uiDomElement);
    uiDomElement.appendChild(sparqlWidget.domElement);
    uiDomElement.appendChild(contextMenu.get());
    

    // Add new options to the context-menu

    const optionCamera = document.createElement('li');
    optionCamera.innerText = 'Focus the camera on the building';
    optionCamera.onclick = () => {
      const clickedResult = fetchC3DTileFeatureWithNodeText(
        view,
        'gml_id',
        getUriLocalname(contextMenu.node.id)
      );
      if (!clickedResult) return;

      console.debug(clickedResult.feature.getInfo());

      focusCameraOn(
        view,
        view.controls,
        clickedResult.feature
          .computeWorldBox3(undefined)
          .getCenter(new THREE.Vector3()),
        {
          verticalDistance: 200,
          horizontalDistance: 200,
        }
      );
    };
    contextMenu.initNewOption('camera',optionCamera);

    const optionExploration = document.createElement('li');
    optionExploration.innerText = 'Add its children';
    optionExploration.onclick = () => {
      sparqlWidget.updateExplorationQuery(getUriLocalname(contextMenu.node.id));
    };
    contextMenu.initNewOption('exploration',optionExploration);

    // Add listeners for D3Canvas node events. Three events are currently recognized 'click', 'mouseover', and 'mouseout'
    sparqlWidget.d3Graph.addEventListener('click', (event) => {

      event.event.stopPropagation();

      const node = event.datum;
      console.log('node clicked: ', node);

      if (node.display && node.realNode) {
        contextMenu.display(event, node);

        if (node.type == 'Building') {
          contextMenu.displayOption('camera');
        }

        if (node.child == undefined && sparqlWidget.explorationQuery != undefined) {
          contextMenu.displayOption('exploration');
        }
      }
      else if (!node.realNode) {
        sparqlWidget.d3Graph.changeVisibilityChildren(node.id);
        sparqlWidget.d3Graph.removeNode(node.id);
        const element = document.getElementById(node.id);
        if (element) {
          element.checked = false;
        }
      }

    });

    const contextSelection = {
      feature: [],
      layer: [],
    };

    sparqlWidget.resetButton.onclick = () => {
      // define a new on click behavior of the 'Clear Graph' button
      sparqlWidget.d3Graph.clearCanvas();
      sparqlWidget.d3Graph.data.clear();
      if (sparqlWidget.explorationQuery) {
        sparqlWidget.explorationQuery.where_conditions = [];
        if (sparqlWidget.queries.length > 1) sparqlWidget.updateQueryTextArea(sparqlWidget.querySelect.value);
        else sparqlWidget.queryTextArea.value = sparqlWidget.explorationQuery.generateQuery();
      }
      if (contextSelection.feature.length) {
        // reset feature userData
        for (let i = 0 ; i < contextSelection.feature.length ; i++){
          contextSelection.feature[i].userData.selectedColor = null;
          contextSelection.layer[i].updateStyle();
        }
        contextSelection.feature = [];
        contextSelection.layer = [];
        view.notifyChange();
      }
    };

    view.domElement.onclick = (event) => {

      // get intersects based on the click event
      const intersects = view.pickObjectsAt(
        event,
        0,
        view.getLayers().filter((el) => el.isC3DTilesLayer)
      );

      if (intersects.length) {
        // get featureClicked
        const featureClicked =
          intersects[0].layer.getC3DTileFeatureFromIntersectsArray(
            intersects
          );
        if (featureClicked && sparqlWidget.explorationQuery != undefined) {
          // update the graph with the node of the clicked building
          const batchTable = featureClicked.getInfo().batchTable;
          const node_id = batchTable.gml_id;
          sparqlWidget.updateExplorationQuery(node_id);
          
          // write in userData the selectedColor
          featureClicked.userData.selectedColor = 'red';

          // and update its style layer
          intersects[0].layer.updateStyle();

          // set contextSelection
          contextSelection.feature.push(featureClicked);
          contextSelection.layer.push(intersects[0].layer);
        }
      }

      view.notifyChange(); // need a redraw of the view
    };

    
      
    // initialize the user menu of graph configuration
    const menuUser = document.createElement('div'); // à afficher que si visualisation graphe
    menuUser.className = 'menuUser';
    sparqlWidget.interfaceElement.insertBefore(menuUser, sparqlWidget.dataView);

    const zoom = document.createElement('input');
    zoom.setAttribute('type', 'range');
    zoom.setAttribute('min', '0.5');
    zoom.setAttribute('max', '1.5');
    zoom.setAttribute('step', '0.25');
    zoom.setAttribute('value', '1');

    const zoomLabel = document.createElement('label');
    zoomLabel.innerText = '\nZoom sensitivity: ';

    const zoomScale = document.createElement('div');
    zoomScale.className = 'scale';

    for (let i = 0.5; i <= 1.5; i += 0.25) {
      const zoomScaleLabel = document.createElement('span');
      zoomScaleLabel.className = 'scale_label';
      zoomScaleLabel.innerText = i;
      zoomScale.appendChild(zoomScaleLabel);
    }

    const menuLabel = document.createElement('label');
    menuLabel.innerText = 'Graph configuration\n';
    menuLabel.className = 'menu-label';

    const buildingIdInput = document.createElement('input');

    const buildingIdLabel = document.createElement('label');
    buildingIdLabel.innerText = '\nBuilding ID: ';

    const showBuildingButton = document.createElement('input');
    showBuildingButton.setAttribute('type', 'submit');
    showBuildingButton.setAttribute('value', 'Show');

    const chargeStrengthConfiguration = document.createElement('input');
    chargeStrengthConfiguration.setAttribute('type', 'range');
    chargeStrengthConfiguration.setAttribute('min', '-80');
    chargeStrengthConfiguration.setAttribute('max', '0');
    chargeStrengthConfiguration.setAttribute('step', '20');
    chargeStrengthConfiguration.setAttribute('value', '-40');

    chargeStrengthConfiguration.oninput = () => { // à changer dans d3Graph > voir pour le rendre dynamique
      sparqlWidget.d3Graph.chargeStrength = chargeStrengthConfiguration.value;
      sparqlWidget.d3Graph.updateForceSimulation();
    };

    const chargeStrengthLabel = document.createElement('label');
    chargeStrengthLabel.innerText = '\n\nStrength of node attraction: ';

    const chargeStrengthScale = document.createElement('div');
    chargeStrengthScale.className = 'scale';

    for (let i = -80; i <= 0; i += 20) {
      const chargeStrengthScaleLabel = document.createElement('span');
      chargeStrengthScaleLabel.className = 'scale_label';
      chargeStrengthScaleLabel.innerText = i;
      chargeStrengthScale.appendChild(chargeStrengthScaleLabel);
    }

    const distanceLinkConfiguration = document.createElement('input');
    distanceLinkConfiguration.setAttribute('type', 'range');
    distanceLinkConfiguration.setAttribute('min', '10');
    distanceLinkConfiguration.setAttribute('max', '50');
    distanceLinkConfiguration.setAttribute('step', '10');
    distanceLinkConfiguration.setAttribute('value', '30');

    distanceLinkConfiguration.oninput = () => {
      sparqlWidget.d3Graph.distanceLink = distanceLinkConfiguration.value;
      sparqlWidget.d3Graph.updateForceSimulation();
    };

    const distanceLinkLabel = document.createElement('label');
    distanceLinkLabel.innerText = '\n Length of links: ';

    const distanceLinkScale = document.createElement('div');
    distanceLinkScale.className = 'scale';

    for (let i = 10; i <= 50; i += 10) {
      const distanceLinkScaleLabel = document.createElement('span');
      distanceLinkScaleLabel.className = 'scale_label';
      distanceLinkScaleLabel.innerText = i;
      distanceLinkScale.appendChild(distanceLinkScaleLabel);
    }

    const forceCenterConfiguration = document.createElement('input');
    forceCenterConfiguration.setAttribute('type', 'range');
    forceCenterConfiguration.setAttribute('min', '0');
    forceCenterConfiguration.setAttribute('max', '0.3');
    forceCenterConfiguration.setAttribute('step', '0.1');
    forceCenterConfiguration.setAttribute('value', '0.1');

    forceCenterConfiguration.oninput = () => {
      sparqlWidget.d3Graph.forceCenter = forceCenterConfiguration.value;
      sparqlWidget.d3Graph.updateForceSimulation();
    };

    const forceCenterLabel = document.createElement('label');
    forceCenterLabel.innerText = '\n Attraction to the graph center: ';

    const forceCenterScale = document.createElement('div');
    forceCenterScale.className = 'scale';

    for (const i of [0, 0.1, 0.2, 0.3]) {
      const forceCenterScaleLabel = document.createElement('span');
      forceCenterScaleLabel.className = 'scale_label';
      forceCenterScaleLabel.innerText = i;
      forceCenterScale.appendChild(forceCenterScaleLabel);
    }

    const zoomCheckBox = document.createElement('input');
    zoomCheckBox.setAttribute('type', 'checkbox');
    zoomCheckBox.setAttribute('id', 'zoom');
    zoomCheckBox.setAttribute('name', 'zoom');
    zoomCheckBox.defaultChecked = true;
    const zoomCheckBoxLabel = document.createElement('label');
    zoomCheckBoxLabel.innerText = ' Zoom Clustering';
    zoomCheckBoxLabel.setAttribute('for', 'zoom');

    zoomCheckBox.oninput = () => {
      if (!zoomCheckBox.checked) {
        sparqlWidget.d3Graph.changeVisibilityChildren('zoom');
        sparqlWidget.d3Graph.removeNode('zoom');
      }
    };

    menuUser.appendChild(menuLabel);
    menuUser.appendChild(zoomLabel);
    menuUser.appendChild(zoom);
    menuUser.appendChild(zoomScale);
    menuUser.appendChild(buildingIdLabel);
    menuUser.appendChild(buildingIdInput);
    menuUser.appendChild(showBuildingButton);
    menuUser.appendChild(chargeStrengthLabel);
    menuUser.appendChild(chargeStrengthConfiguration);
    menuUser.appendChild(chargeStrengthScale);
    menuUser.appendChild(distanceLinkLabel);
    menuUser.appendChild(distanceLinkConfiguration);
    menuUser.appendChild(distanceLinkScale);
    menuUser.appendChild(forceCenterLabel);
    menuUser.appendChild(forceCenterConfiguration);
    menuUser.appendChild(forceCenterScale);
    menuUser.appendChild(zoomCheckBox);
    menuUser.appendChild(zoomCheckBoxLabel);

  showBuildingButton.onclick = () => {
    // add on click behavior of the 'Show' button: focus the camera of the building matching the ID written in the input
    const node_id = buildingIdInput.value;
    const clickedResult = fetchC3DTileFeatureWithNodeText(
      view,
      'gml_id',
      node_id
    );
    if (!clickedResult) {
      alert('No building with this ID !')
      return;
    }

    console.log(clickedResult.feature.getInfo());

    focusCameraOn(
      view,
      view.controls,
      clickedResult.feature
        .computeWorldBox3(undefined)
        .getCenter(new THREE.Vector3()),
      {
        verticalDistance: 200,
        horizontalDistance: 200,
      }
    );
  };
});