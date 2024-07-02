import * as proj4 from 'proj4';
import * as itowns from 'itowns';
import * as extensions3DTilesTemporal from '@ud-viz/extensions_3d_tiles_temporal';
import {
  loadMultipleJSON,
  initScene,
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
   
    // Add listeners for D3Canvas node events. Three events are currently recognized 'click', 'mouseover', and 'mouseout'
    sparqlWidget.d3Graph.addEventListener('click', (event) => {

      const node = event.datum;
      console.log('node clicked: ', node);

      sparqlWidget.menu.style.left = `${event.event.pageX}px`;
      sparqlWidget.menu.style.top = `${event.event.pageY}px`;

      sparqlWidget.menu.style.display = 'block';

      if (node.child != undefined) {
        sparqlWidget.optionCluster.onclick = () => {
          sparqlWidget.d3Graph.changeVisibilityChildren(node.id);
          sparqlWidget.menu.style.display = 'none';
          if (!node.realNode){
            sparqlWidget.d3Graph.removeNode(node.id);
          }
          sparqlWidget.d3Graph.update();
        };
        sparqlWidget.optionCluster.style.display = 'block';
        if (node.cluster) {
          sparqlWidget.optionCluster.innerText = 'Afficher ses descendants';
        } else {
          sparqlWidget.optionCluster.innerText = 'Cacher ses descendants';
          if (node.realNode) {
            const childrenType = sparqlWidget.d3Graph.getChildrenType(node.id);
            if (childrenType.length) {
              sparqlWidget.menuList.insertBefore(sparqlWidget.optionsType,sparqlWidget.optionAnnuler);
              while (sparqlWidget.optionsType.hasChildNodes()) {
                sparqlWidget.optionsType.removeChild(sparqlWidget.optionsType.firstChild);
              }
              for (const type of childrenType) {
                const option = document.createElement('li');
                option.innerText = 'Cacher ses enfants de type ' + type;
                option.onclick = () => {
                  const childrenList = sparqlWidget.d3Graph.getChildrenByType(node.id,type);
                  sparqlWidget.d3Graph.createNewCluster('cluster_' + type, childrenList, node.id);
                  sparqlWidget.menuList.removeChild(sparqlWidget.optionsType);
                  sparqlWidget.menu.style.display = 'none';
                };
                sparqlWidget.optionsType.appendChild(option);
              }
            }
          }
        }
      }
      else if (sparqlWidget.querySelect.value == 0) {
        sparqlWidget.optionAddChildren.onclick = () => {
          sparqlWidget.updateExplorationQuery(node.id);
          sparqlWidget.menu.style.display = 'none';
          sparqlWidget.optionAddChildren.style.display = 'none';
        };
        sparqlWidget.optionAddChildren.style.display = 'block';
        sparqlWidget.optionCluster.style.display = 'none'; // pas vraiment ici
      } 
    });

    // graph event
    /*sparqlWidget.d3Graph.addEventListener('click', (event) => {
      // Get clicked node's data, if nodeData.type is 'Building', zoom camera on a feature with the same 'gmlid' as nodeData.id
      const nodeData = sparqlWidget.d3Graph.data.getNodeByIndex(
        event.datum.index
      );

      console.debug('node clicked: ', nodeData);

      if (getUriLocalname(nodeData.type) == 'Building') {
        const clickedResult = fetchC3DTileFeatureWithNodeText(
          view,
          'gml_id',
          getUriLocalname(nodeData.id)
        );
        if (!clickedResult) return;

        focusCameraOn(
          view,
          view.controls,
          clickedResult.layer
            .computeWorldBox3(clickedResult.feature)
            .getCenter(new THREE.Vector3()),
          {
            verticalDistance: 200,
            horizontalDistance: 200,
          }
        );
      }
    });*/

    // graph event
    /*sparqlWidget.table.addEventListener('click', (event) => {
      const col = event.datum.col;
      const row = event.datum.row;
      const clickedResult = fetchC3DTileFeatureWithNodeText(
        view,
        'gml_id',
        getUriLocalname(row[col].value)
      );
      if (!clickedResult) return;

      console.debug('clicked cell value: ', row[col].value);

      focusCameraOn(
        view,
        view.controls,
        clickedResult.layer
        
          .computeWorldBox3(clickedResult.feature)
          .getCenter(new THREE.Vector3()),
        {
          verticalDistance: 200,
          horizontalDistance: 200,
        }
      );
    });*/
  });