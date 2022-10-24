class RegionMap {

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

        vis.validRegion = [];

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        vis.colourScheme = "Default";

        vis.zoom = d3.zoom()
            .scaleExtent([1, 6])
            .translateExtent([[vis.config.margin.left + vis.config.margin.right, vis.config.margin.top + vis.config.margin.bottom], [vis.width, vis.height]])
            .on('zoom', function () {
                vis.chartRegions.selectAll('path')
                    .attr('transform', d3.event.transform);
                // vis.chartPoints.selectAll('circle')
                //     .attr('transform', d3.event.transform);
            });

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .call(vis.zoom);

        vis.chartPoints = vis.svg.append("g");
        vis.chartRegions = vis.svg.append("g");

        vis.projection = d3.geoMercator()
            .center([103.8198, 1.3521])
            .translate([vis.width / 2, vis.height / 2])
            .scale(vis.width * 350 / Math.PI)

        vis.path = d3.geoPath().projection(vis.projection)

        vis.jsonMapping = {};
        vis.jsonMapping["Singapore"] = { file: "sg plan area 20170903.json", obj: "Singapore" };

        vis.palette = {};
        vis.palette["Default"] = { region: "#b4a606", points: "#a20019", highlight: "#01a669" };
        vis.palette["CBF"] = { region: "#013277", points: "#ff5f98", highlight: "#b44900" };
        vis.fillValidColor = d => vis.validRegion.includes(d.properties.PLN_AREA_N) ? vis.palette[vis.colourScheme].region : "#fff"
    }

    update() {
        let vis = this;
        vis.render();
    }

    render() {
        let vis = this;
        // Render Map
        vis.chartRegions.selectAll("path").remove();
        d3.json("data/" + vis.jsonMapping["Singapore"].file).then(t => {
            let path = vis.chartRegions.selectAll(".sgarea")
                .data(t.features);

            path.enter()
                .append("path")
                .attr("d", vis.path)
                .attr("title", function (d) {
                    return d.properties.PLN_AREA_N;
                })
                .attr("stroke", "#808080")
                .style("fill", vis.fillValidColor)
                .on("mouseover", function () {
                    let region = d3.select(this);
                    region.style("fill", vis.palette[vis.colourScheme].highlight);
                })
                .on("mouseout", function () {
                    let region = d3.select(this);
                    region.style("fill", vis.fillValidColor);
                })
                .on("click", function (d) {
                    let region = d.properties.PLN_AREA_N;
                    if (!vis.validRegion.includes(region)) {
                        vis.svg.transition().duration(2000).call(
                            vis.zoom.transform,
                            d3.zoomIdentity
                        );
                        return;
                    };
                    let mouse = d3.mouse(this);
                    d3.event.stopPropagation();
                    vis.svg.transition().duration(2000).call(
                        vis.zoom.transform,
                        d3.zoomIdentity.translate(vis.width / 2, vis.height / 2).scale(4).translate(-mouse[0], -mouse[1])
                    );
                    onRegionSelect(region);
                })
                .append("svg:title")
                .text(function (d) { return d.properties.PLN_AREA_N; });
        });
    }
}
