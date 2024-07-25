/** @class */

/**
 * The class that creates a list of checkboxes for the clusterisation by type.
 */
export class GraphClusteringByType {
  /**
   * Create a new Context Menu
   *
   * @param {D3GraphCanvas} d3Graph The graph.
   */
  constructor(d3Graph) {
    this.d3Graph = d3Graph;

    /** @type {HTMLDivElement} */
    this.menu = document.createElement('g');
    this.menu.style.display = 'flex';
    this.menu.setAttribute('id', 'type-clustering-menu');
    }

    
  /**
   * Get the menu
   *
   * @returns {HTMLDivElement} the menu
   */
  get() {
    return this.menu;
  }

  /**
   * Init the list of checkboxes
   *
   */
  init() {

    while(this.menu.hasChildNodes()) {
      this.menu.removeChild(this.menu.firstChild);
    }

    const typeList = this.d3Graph.getTypeList();
    for (const type of typeList) {
      const option = document.createElement('input');
      option.setAttribute('type', 'checkbox');
      option.setAttribute('id',type);
      option.oninput = () => {
        if (option.checked) {
        const nodeList = this.d3Graph.getNodeByType(type);
        this.d3Graph.createNewCluster(type, nodeList, undefined);
        this.d3Graph.update();
        } else {
          this.d3Graph.changeVisibilityChildren(option.id);
          this.d3Graph.removeNode(option.id);
        }
      };
      const optionLabel = document.createElement('label');
      optionLabel.innerText = type;
      optionLabel.setAttribute('for', type);
      this.menu.appendChild(option);
      this.menu.appendChild(optionLabel);
    }
  }
}