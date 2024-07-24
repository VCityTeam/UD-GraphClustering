# Graph Clustering User Guide
This is a user guide for using Graph Clustering functionalities. 

## Interface

![interface](https://github.com/user-attachments/assets/3f170b63-06a7-4685-a537-f8e881c8d1ec)

The interface includes three optional widgets:
- a list of checkboxes in the top left-hand corner for clustering by type implemented in the `GraphClusteringByType.js`
- a drop-down menu that appears when you click on a graph node implemented in the `ContextMenuGraphClustering.js`
- a menu for configuring graph forces implemented in the demo

#### Context Menu for Graph Clustering
Clicking on any node will display, in a context menu, all the possible actions related to the node.

| Action title                          | Description                                                                                                                             | Apply to                                               |
| ------------------------------------- |:--------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Hide the descendants                  | Transforms the node into a cluster in which all its descendants are hidden                                                              | Nodes with children part of an acyclic subgraph        |
| Hide the children                     | Transforms the node into a cluster in which all its children are hidden                                                                 | Nodes with children part of a cyclic subgraph          |
| Show the children/descendants         | Makes all its children/descendants reappear                                                                                             | Nodes with children                                    |
| Hide the children with the type '...' | Creates a new cluster node linked to the clicked node in which all its children with the specified type and their descendant are hidden | Nodes whose children have more than one different type | 

*Hide / Show the children*

![clustering-children](https://github.com/user-attachments/assets/43b70d7c-db14-4906-b65b-a481626aa61e)

Clicking on a created cluster node removes the node from the graph and makes the children reappear.

#### Clustering by type

![clustering-by-type](https://github.com/user-attachments/assets/267b16fc-e6d2-4549-afc3-29f22437e763)

The class `GraphClusteringByType.js` generates a checkbox for each type of node in the graph. Clicking on a checkbox creates a cluster in which all nodes of that type are grouped together.
