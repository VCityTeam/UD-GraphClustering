import * as proj4 from 'proj4';
import * as itowns from 'itowns';
import * as THREE from 'three';
import * as extensions3DTilesTemporal from '@ud-viz/extensions_3d_tiles_temporal';
import {
  loadMultipleJSON,
  initScene,
  getUriLocalname,
  fetchC3DTileFeatureWithNodeText,
  focusCameraOn
} from "@ud-viz/utils_browser";
import * as widgetSPARQL from '@ud-viz/widget_sparql';


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

    // eslint-disable-next-line no-constant-condition
    if ('RUN_MODE' == 'production')
      loadingScreen(view, ['UD-VIZ', 'UDVIZ_VERSION']);

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
    const sparqlWidget = new widgetSPARQL.SparqlQueryWindow(
      new widgetSPARQL.SparqlEndpointResponseProvider(
        configs['sparql_server']
      ),
      configs['sparql_widget']
    );
    sparqlWidget.domElement.classList.add('widget_sparql');

    // Add UI
    const uiDomElement = document.createElement('div');
    uiDomElement.classList.add('full_screen');
    document.body.appendChild(uiDomElement);
    uiDomElement.appendChild(sparqlWidget.domElement);

    // hide the context menu
    window.onclick = () => { 
      sparqlWidget.menu.style.display = 'none';
     };

    // store the children who have already been hidden
    var hiddenChildren = new Map();
   
    // add listeners for D3Canvas node events. Three events are currently recognized 'click', 'mouseover', and 'mouseout'
    sparqlWidget.d3Graph.addEventListener('click', (event) => {

      event.event.stopPropagation();

      const node = event.datum;
      console.log('node clicked: ', node);

      if (node.display) {
        // display the context menu with a list of all possible actions for the clicked node
        sparqlWidget.menu.style.left = `${event.event.pageX}px`;
        sparqlWidget.menu.style.top = `${event.event.pageY}px`;
        sparqlWidget.menu.style.display = 'block';

        // reset the list of options 
        while (sparqlWidget.optionsType.hasChildNodes()) {
          sparqlWidget.optionsType.removeChild(sparqlWidget.optionsType.firstChild);
        }

        if (node.child != undefined) {
          // add the option to show/hide the descendants of the node
          sparqlWidget.optionAddChildren.style.display = 'none';
          sparqlWidget.optionCluster.style.display = 'block';
          sparqlWidget.optionCluster.onclick = () => {
            sparqlWidget.d3Graph.changeVisibilityChildren(node.id);
            if (!node.realNode) {
              // if the node is a created cluster, it is removed when you click on it
              sparqlWidget.d3Graph.removeNode(node.id);
              hiddenChildren.set(node.parent[0],hiddenChildren.get(node.parent[0]).filter((d) => d != node.id));
            }
            sparqlWidget.d3Graph.update();
            sparqlWidget.optionCluster.style.display = 'none';
          };
          if (node.cluster) {
            sparqlWidget.optionCluster.innerText = 'Show the descendants';
          } else {
            sparqlWidget.optionCluster.innerText = 'Hide the descendants';
            if (node.realNode) {
              // add the options to create a new cluster that hides all children of a node with a specific type
              const childrenType = sparqlWidget.d3Graph.getChildrenType(node.id);
              if (childrenType.length > 1) {
                sparqlWidget.menuList.appendChild(sparqlWidget.optionsType);
                if (!hiddenChildren.has(node.id)) hiddenChildren.set(node.id,[]);
                for (const type of childrenType) {
                  if (!hiddenChildren.get(node.id).includes(type)) {
                    const option = document.createElement('li');
                    option.innerText = 'Hide the children with type ' + type;
                    option.onclick = () => {
                      hiddenChildren.get(node.id).push(type);
                      const childrenList = sparqlWidget.d3Graph.getChildrenByType(node.id,type);
                      sparqlWidget.d3Graph.createNewCluster(type, childrenList, node.id);
                      sparqlWidget.d3Graph.update();
                      sparqlWidget.menuList.removeChild(sparqlWidget.optionsType);
                    };
                    sparqlWidget.optionsType.appendChild(option);
                  }
                }
              }
            }
          }
        } else {
          // only works with the exploration query
          sparqlWidget.optionCluster.style.display = 'none';
          sparqlWidget.optionAddChildren.style.display = 'block';
          sparqlWidget.optionAddChildren.onclick = () => {
            sparqlWidget.updateExplorationQuery(getUriLocalname(node.id));
            sparqlWidget.optionAddChildren.style.display = 'none';
          };
        }

        if (node.type == 'Building') {
          // add the option to focus the camera on the matching 3D building
          sparqlWidget.optionCamera.style.display = 'block';
          sparqlWidget.optionCamera.onclick = () => {
            const clickedResult = fetchC3DTileFeatureWithNodeText(
              view,
              'gml_id',
              getUriLocalname(node.id)
            );
            if (!clickedResult) return;
    
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
        } else {
          sparqlWidget.optionCamera.style.display = 'none';
        }
      }
    });

    const contextSelection = {
      feature: [],
      layer: [],
    };

    sparqlWidget.resetButton.onclick = () => {
      // add on click behavior of the 'Clear Graph' button :reset the graph and the 3D view
      sparqlWidget.d3Graph.clearCanvas();
      sparqlWidget.d3Graph.data.clear();
      sparqlWidget.explorationQuery.where_conditions = [];
      if (sparqlWidget.queries.length > 1) sparqlWidget.updateQueryTextArea(sparqlWidget.querySelect.value);
      else sparqlWidget.queryTextArea.value = sparqlWidget.explorationQuery.generateQuery();
      if (contextSelection.feature.length) {
        // reset feature userData
        for (let i = 0 ; i < contextSelection.feature.length ; i++){
          contextSelection.feature[i].userData.selectedColor = null;
          contextSelection.layer[i].updateStyle();
        }
        contextSelection.feature = [];
        contextSelection.layer = [];
      }
      view.notifyChange();
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
        if (featureClicked) {
          // update the graph with the node of the clicked building
          const batchTable = featureClicked.getInfo().batchTable;
          const node_id = batchTable.gml_id;
          sparqlWidget.updateExplorationQuery(node_id);
          
          // write in userData the selectedColor
          featureClicked.userData.selectedColor = 'red';

          // and update its style layer
          console.log(intersects[0].layer.updateStyle());

          // set contextSelection
          contextSelection.feature.push(featureClicked);
          contextSelection.layer.push(intersects[0].layer);
        }
      }

      view.notifyChange(); // need a redraw of the view
    };

    sparqlWidget.showBuildingButton.onclick = () => {
      // add on click behavior of the 'Show' button: focus the camera of the building matching the ID written in the input
      const node_id = sparqlWidget.buildingIdInput.value;
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