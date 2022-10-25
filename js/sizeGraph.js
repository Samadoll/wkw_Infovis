class SizeGraph {
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
        vis.height = vis.config.containerHeight - vis.config.margin.top;

        vis.regionFocus = undefined;
        vis.year = 2017;

        let svg = d3.select(vis.config.parentElement).attr("width", vis.config.containerWidth).attr("height", vis.config.containerHeight);
        vis.chart = svg.append("g").attr('transform', `translate(${75},0)`);

        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('y', -45)
            .attr('x', -vis.height / 2)
            .attr('transform', `rotate(-90)`)
            .attr('text-anchor', 'middle')
            .attr("font-family", "sans-serif")
            .text('Average Resale Price (Dollars)');

        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('y', vis.height + 40)
            .attr('x', vis.width / 2)
            .attr('text-anchor', 'middle')
            .text('Size (Square Meters)');

        vis.xValue = d => d.size;

        vis.yScale = d3.scaleLinear()
            // .domain([0, 500])
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(-vis.width)
            .tickPadding(10)
            .tickFormat((d, i) => `${d / 1000}k`);

        vis.axisY = vis.chart.append('g');
        vis.axisG = vis.chart.append('g');

    }

    update() {
        let vis = this;
        vis.filteredData = vis.data.filter(t => t.year == vis.year);
        if (vis.regionFocus != undefined) vis.filteredData = vis.filteredData.filter(t => t.town == vis.regionFocus);
        else {
            let groupData = vis.filteredData.reduce((group, datum) => {
                group[datum.size] = group[datum.size] ?? [];
                group[datum.size].push(datum);
                return group;
            }, {})
            let processedData = [];
            Object.entries(groupData).forEach(([key, val], _) => {
                processedData.push({
                    size: key,
                    town: "SINGAPORE",
                    price: Math.round(val.reduce((acc, r) => acc + r.price, 0) / val.length)
                })
            })
            vis.filteredData = processedData;
        }
        vis.filteredData = vis.filteredData.sort((a, b) => (+a.size) - (+b.size));

        vis.yValue = d => d.price;
        vis.xScale = d3.scaleBand()
            .domain(vis.filteredData.map(vis.xValue))
            .range([0, vis.width])
            .padding(0.2);
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSize(-vis.height)
            .tickPadding(5);

        let maxHeight = d3.max(vis.filteredData, d => vis.yValue(d));
        let adjustedMaxHeight = Math.floor(maxHeight / 100) * 100;
        vis.yScale.domain([0, adjustedMaxHeight + (adjustedMaxHeight + 100 - maxHeight <= 50 && adjustedMaxHeight !== maxHeight ? 200 : 100)]);

        vis.render();
    }

    render() {
        let vis = this;

        vis.axisG.call(vis.xAxis).attr('transform', `translate(0,${vis.height})`)
            .selectAll("text")
            .attr("dx", "-4")
            .attr("dy", "-1")
            .attr("transform", "rotate(-90)")
            .attr("font-family", "sans-serif")
            .style("text-anchor", "end");
        vis.axisG.call(g => g.selectAll("line").remove());
        vis.axisY.transition().duration(500).call(vis.yAxis).call(g => g.selectAll("line").attr("style", "color: #D3D3D3"))
        vis.chart.selectAll(".size_graph_rect").remove()

        vis.chart.selectAll('.rect')
            .data(vis.filteredData)
            .enter()
            .append('rect')
            .attr("class", "size_graph_rect")
            .attr("id", d => `${d.town}_${d.size}`.split(" ").join("").replace(".", "_"))
            .attr('x', d => vis.xScale(vis.xValue(d)))
            .attr('y', d => vis.yScale(vis.yValue(d)))
            .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
            .attr('width', vis.xScale.bandwidth())
            .attr('fill', "steelblue")
            .on("mouseover", d => d3.select(`#${d.town}_${d.size}`.split(" ").join("").replace(".", "_")).style("stroke", "#000"))
            .on("mouseout", d => d3.select(`#${d.town}_${d.size}`.split(" ").join("").replace(".", "_")).style("stroke", null))
            .append("svg:title")
            .text(d => d.price);
    }
}
