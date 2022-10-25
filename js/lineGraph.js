class LineGraph {
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

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right - 65;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        let svg = d3.select(vis.config.parentElement).attr("width", vis.config.containerWidth).attr("height", vis.config.containerHeight);
        vis.chart = svg.append("g").attr('transform', `translate(${75},${vis.config.margin.top})`);

        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('y', -45)
            .attr('x', -vis.height / 2)
            .attr('transform', `rotate(-90)`)
            .attr('text-anchor', 'middle')
            .attr("font-family", "sans-serif")
            .text('Average Price Per Square Meter (Dollars)');

        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('y', vis.height + 35)
            .attr('x', vis.width / 2)
            .attr('text-anchor', 'middle')
            .text('Month');

        vis.xValue = d => d3.timeParse("%Y-%m")(d.month);

        vis.yValue = d => d.avg_price_per_sqm

        vis.yScale = d3.scaleLinear()
            // .domain([0, 500])
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(-vis.width)
            .tickPadding(10);

        vis.axisY = vis.chart.append('g');
        vis.axisG = vis.chart.append('g');
    }

    update() {
        let vis = this;

        vis.filteredData = vis.data;
        if (vis.regionFocus != undefined) vis.filteredData = vis.data.filter(t => t.town == vis.regionFocus);
        else {
            let groupData = vis.filteredData.reduce((group, datum) => {
                group[datum.month] = group[datum.month] ?? [];
                group[datum.month].push(datum);
                return group;
            }, {})
            let processedData = [];
            Object.entries(groupData).forEach(([key, val], _) => {
                processedData.push({
                    month: key,
                    town: "SINGAPORE",
                    avg_price_per_sqm: Math.round(val.reduce((acc, r) => acc + r.avg_price_per_sqm, 0) / val.length)
                })
            })
            vis.filteredData = processedData;
        }

        vis.yValue = d => d["avg_price_per_sqm"];

        vis.xScale = d3.scaleTime()
            .domain(d3.extent(vis.filteredData, vis.xValue))
            .range([0, vis.width])
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSize(-vis.height)
            .tickPadding(5);

        let maxHeight = d3.max(vis.filteredData, d => vis.yValue(d));
        let adjustedMaxHeight = Math.floor(maxHeight / 100) * 100;
        let minHeight = d3.min(vis.filteredData, d => vis.yValue(d));
        let adjustedMinHeight = Math.floor(minHeight / 100) * 100;
        vis.yScale.domain([adjustedMinHeight, adjustedMaxHeight + (adjustedMaxHeight + 100 - maxHeight <= 50 && adjustedMaxHeight !== maxHeight ? 200 : 100)]);

        vis.render();
    }

    render() {
        let vis = this;

        vis.axisG.call(vis.xAxis).attr('transform', `translate(0,${vis.height})`);
        vis.axisG.call(g => g.selectAll("line").remove());
        vis.axisY.transition().duration(500).call(vis.yAxis).call(g => g.selectAll("line").attr("style", "color: #D3D3D3"))
        vis.chart.selectAll(".line_path").remove()

        vis.chart.append("path")
            .datum(vis.filteredData)
            .attr("class", "line_path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => {
                    let xx = vis.xScale(vis.xValue(d))
                    // console.log(xx);
                    return xx;
                })
                .y(d => {
                    let yy = vis.yScale(vis.yValue(d))
                    console.log(d);
                    console.log(vis.yValue(d));
                    console.log(yy);
                    return yy;
                })
            )
    }
}
