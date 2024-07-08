# Graph Clustering User Guide
This is a user guide for using the Graph Clustering functionalities as a part of the SparqlQueryWidget. This is a UD-Viz Widget for visualizing urban graph data and interacting with objects in the 3D scene.

The Widget is displayed on the top left corner of the screen.

## Interface

### Show/Hide Query
This button can toggle whether the text area for the query to be submitted is shown or not. This also allows the query to be edited before submission.

Queries are written in [SPARQL](https://www.w3.org/TR/sparql11-query/)

### Select Result Visualization Format
Use this dropdown menu to select how the query result will be visualized. Currently 2 modes are presented that enable different functionalities to interact with the 3D scene:

### Interactions with the Graph
Clicking on any node will display, in a context menu, all the possible actions related to the node.



| Action title                          | Description                                                                                                                             | Apply to                                               |
| ------------------------------------- |:--------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Hide the descendants                  | Transforms the node into a cluster in which all its descendants are hidden                                                              | Nodes with children                                    |
| Show the descendants                  | Makes all its children reappear                                                                                                         | Nodes with children                                    |
| Add its children                      | Updates the SPARQL query to add the children of the clicked node, if it has some                                                        | Nodes without children yet                             |
| Focus the camera on the building      | Zooms the camera on the building in the 3D scene                                                                                        | Building nodes                                         |
| Hide the children with the type '...' | Creates a new cluster node linked to the clicked node in which all its children with the specified type and their descendant are hidden | Nodes whose children have more than one different type | 

Clicking on a created cluster node removes the node from the graph and makes the children reappear.

The action "Add its children" is not available with all query but only the original one, that is called the "exploration query".
