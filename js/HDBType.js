class HDBType {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 600,
        }

        this.config.margin = _config.margin || { top: 50, bottom: 50, right: 10, left: 10 }

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        vis.colourScheme = "Default";
    }

    update() {
        let vis = this;
        vis.render();
    }

    render() {
        let vis = this;
        
    }
}