# Sparql widget demo

One application of the Graph Clustering Research Project is a part of the SPARQL module [here](packages/widget_sparql/Readme.md). This is a UD-Viz widget for visualizing urban graph data and interacting with objects in the 3D scene.

## Graph view
#### Graph configuration

![graph_configuration](https://github.com/user-attachments/assets/cd0e38f0-a7f3-4280-9ac5-2daad8cbc3ab)

Use the "Graph configuration" menu to enable or disable zoom clustering. This function hides nodes according to their group when zoomed into the graph, and displays them when zoomed out. The "Zoom sensitivity" parameter allows you to influence the speed at which zoom clustering operates.

*Zoom clustering*

![zoom-clustering](https://github.com/VCityTeam/UD-GraphClustering/assets/129035607/02cd51a7-e6a7-408e-9f78-1d2c007a6216)

You can also modify the forces exerted on and between nodes, as well as the length of the links connecting them.

The "Building ID" input lets you find and focus the camera on any building in the 3D scene, by knowing its ID.

*Show button*

![show-building](https://github.com/VCityTeam/UD-GraphClustering/assets/129035607/b5a9a84b-4f8d-4ae9-9f77-b9df1618f305)

#### Interactions with the 3D scene
Clicking on a building of the 3D scene will add the corresponding node and its children to the graph. This functionality is made possible by the URIs of nodes in the graph that corresponds with identifiers of objects in the tileset's batch table.

![click-building](https://github.com/VCityTeam/UD-GraphClustering/assets/129035607/a6069e8d-5369-49dc-bcf9-84f900784346)

#### Added options to the context menu
In the demonstration based on the sparql widget, two options have been added to the context menu.

| Action title                          | Description                                                                                                                             | Apply to                                               |
| ------------------------------------- |:--------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Add its children                      | Updates the SPARQL query to add the children of the clicked node, if it has some                                                        | Nodes without children yet (exploration query only)    |
| Focus the camera on the building      | Zooms the camera on the building in the 3D scene                                                                                        | Building nodes                                         |

The action "Add its children" is not available with all queries but only with queries defined with an exploration property in the [sparql_widget.json](https://github.com/VCityTeam/UD-GraphClustering/blob/master/assets/config/widget/sparql_widget.json) file.
