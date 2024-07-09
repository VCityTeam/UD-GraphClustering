# Graph Clustering User Guide
This is a user guide for using the Graph Clustering functionalities as a part of the SparqlQueryWidget. This is a UD-Viz Widget for visualizing urban graph data and interacting with objects in the 3D scene.

The Widget is displayed on the top left corner of the screen.

## Interface

![interface](https://github.com/VCityTeam/UD-GraphClustering/assets/129035607/4f37cb88-ae12-44b6-9d34-6a7d852bd38c)

### Show/Hide Query
This button can toggle whether the text area for the query to be submitted is shown or not. This also allows the query to be edited before submission.

Queries are written in [SPARQL](https://www.w3.org/TR/sparql11-query/)

### Select Result Visualization Format
Use this dropdown menu to select how the query result will be visualized. Currently 2 modes are presented that enable different functionalities to interact with the 3D scene:
-JSON
-Graph

## Graph view
#### Graph configuration

Use the "Graph configuration" menu to enable or disable zoom clustering. This function hides nodes according to their group when zoomed into the graph, and displays them when zoomed out. The "Zoom sensitivity" parameter allows you to influence the speed at which zoom clustering operates.

*Zoom clustering*

![zoom-clustering](https://github.com/VCityTeam/UD-GraphClustering/assets/129035607/02cd51a7-e6a7-408e-9f78-1d2c007a6216)

You can also modify the forces exerted on and between nodes, as well as the length of the links connecting them.

#### Interactions with the Graph
Clicking on any node will display, in a context menu, all the possible actions related to the node.

![chrome-capture-2024-7-9](https://github.com/VCityTeam/UD-GraphClustering/assets/129035607/ed13b653-32aa-4801-b82f-d39ac90b5d32)

| Action title                          | Description                                                                                                                             | Apply to                                               |
| ------------------------------------- |:--------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Hide the descendants                  | Transforms the node into a cluster in which all its descendants are hidden                                                              | Nodes with children                                    |
| Show the descendants                  | Makes all its children reappear                                                                                                         | Nodes with children                                    |
| Add its children                      | Updates the SPARQL query to add the children of the clicked node, if it has some                                                        | Nodes without children yet                             |
| Focus the camera on the building      | Zooms the camera on the building in the 3D scene                                                                                        | Building nodes                                         |
| Hide the children with the type '...' | Creates a new cluster node linked to the clicked node in which all its children with the specified type and their descendant are hidden | Nodes whose children have more than one different type | 

*Hide/Show the descendants*

![clic-clustering](https://github.com/VCityTeam/UD-GraphClustering/assets/129035607/307b3878-31d3-49ee-b98a-144965b089c2)

Clicking on a created cluster node removes the node from the graph and makes the children reappear.

The action "Add its children" is not available with all query but only the original one, that is called the "exploration query".
