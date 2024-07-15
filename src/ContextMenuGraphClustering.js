// insertion du css ??

/** @class */

/**
 * The class that adds the display of a drop-down menu containing clustering functionalities when a node is clicked
 */
export class ContextMenuGraphClustering {
  /**
   * Create a new Context Menu
   *
   * @param {D3GraphCanvas} d3Graph The graph.
   */
  constructor(d3Graph) {
    this.d3Graph = d3Graph;

    /** @type {HTMLDivElement} */
    this.menu = document.createElement('div');
    this.menu.setAttribute('id', 'context-menu');

    /** @type {HTMLUListElement} */
    this.menuList = document.createElement('ul');
    this.menu.appendChild(this.menuList);

    /** @type {Map} */
    this.optionsMap = new Map();
  
    /** @type {Object} */
    this.node = null;
    
    window.onclick = () => { 
      this.hide();
    };

    this.hiddenChildren = new Map();
    this.initOptionClusterDescendants();
    this.initOptionClusterChildrenByType();
  }

  /**
   * Initialize the clustering by descendants
   *
   */
  initOptionClusterDescendants() {
    const optionElement = document.createElement('li');
    optionElement.onclick = () => {
      this.d3Graph.changeVisibilityChildren(this.node.id);
      if (!this.node.realNode) {
        // if the node is a created cluster, it is removed when you click on it
        this.d3Graph.removeNode(this.node.id);
        this.hiddenChildren.set(this.node.parent[0],this.hiddenChildren.get(this.node.parent[0]).filter((d) => d != this.node.id));
      }
      this.d3Graph.update();
    };
    this.menuList.appendChild(optionElement);
    this.optionsMap.set('cluster', optionElement);
  }

  /**
   * Initialize the clustering of children by type
   *
   */
  initOptionClusterChildrenByType() {
    const optionsContainer = document.createElement('g');
    this.menuList.appendChild(optionsContainer);
    this.optionsMap.set('typeContainer', optionsContainer);
  }

  /**
   * Add a new option to the context menu
   *
   * @param {string} id an id for the option
   * @param {HTMLLIElement} option the new option (its onclick and innerText properties must be defined)
   * 
   */
  initNewOption(id, option) {
    this.menuList.appendChild(option);
    this.optionsMap.set(id, option);
  }

  /**
   * Get an option by id
   *
   * @param {string} id the id of the option
   * @returns {HTMLLIElement} the option
   * 
   */
  getOptionById(id) {
    if (this.optionsMap.has(id)) {
      return this.optionsMap.get(id);
    } else {
      return null;
    }
  }

  /**
   * Get the menu
   *
   * @returns {HTMLDivElement} the menu
   * 
   */
  get() {
    return this.menu;
  }

  /**
   * Display an added option in the context menu
   *
   * @param {string} id the id of the option
   * 
   */
  displayOption(id) {
    if (this.optionsMap.has(id)) {
      this.optionsMap.get(id).style.display = 'block';
    }
  }

  /**
   * Display the context menu and its original options
   *
   * @param {event} event the click event
   * @param {Object} node a node
   * 
   */
  display(event,node) {
    this.hide();

    this.node = node;

    this.menu.style.left = `${event.event.pageX}px`;
    this.menu.style.top = `${event.event.pageY}px`;
    this.menu.style.display = 'block';

    if (node.child != undefined) {
      const optionCluster = this.optionsMap.get('cluster');
      optionCluster.style.display = 'block';
      if (node.cluster) {
        optionCluster.innerText = 'Show the descendants';
      } else {
        optionCluster.innerText = 'Hide the descendants';
      }

      const childrenType = this.d3Graph.getChildrenType(this.node.id);
      if (childrenType.length > 1) {
        const optionsClusterByType = this.optionsMap.get('typeContainer');
        optionsClusterByType.style.display = 'block';
        if (!this.hiddenChildren.has(node.id)) this.hiddenChildren.set(this.node.id,[]);
        for (const type of childrenType) {
          if (!this.hiddenChildren.get(this.node.id).includes(type)) {
            const option = document.createElement('li');
            option.innerText = 'Hide the children with type ' + type;
            option.onclick = () => {
              this.hiddenChildren.get(node.id).push(type);
              const childrenList = this.d3Graph.getChildrenByType(this.node.id,type);
              this.d3Graph.createNewCluster(type, childrenList, this.node.id);
              this.d3Graph.update();
            };
            optionsClusterByType.appendChild(option);
          }
        }
      }
    }
  }

  /**
   * Hide the context menu and reset its displayed options
   *
   */
  hide() {
    this.menu.style.display = 'none';
    for (const option of this.optionsMap.values()) {
      option.style.display = 'none';
    }
    const optionsClusterByType = this.optionsMap.get('typeContainer');
    while (optionsClusterByType.hasChildNodes()) {
      optionsClusterByType.removeChild(optionsClusterByType.firstChild);
    }
  }

}