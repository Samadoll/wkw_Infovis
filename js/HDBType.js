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

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right - 65;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.colorSet = ["#e6afd3", "#a7dab0", "#aebaeb", "#d2d39d", "#71cdeb", "#e6b197", "#8adbd3"]
        vis.typeSet = ["1 ROOM", "2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE", "MULTI-GENERATION"]
        vis.regionFocus = undefined;

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
            .text('Year');

        vis.xValue = d => d.year;
        vis.subXValue = d => d.type;

        vis.yScale = d3.scaleLinear()
            // .domain([0, 500])
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(-vis.width)
            .tickPadding(10);


        vis.axisY = vis.chart.append('g');
        vis.axisG = vis.chart.append('g');

        // Legends
        svg.append("line")
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 15)
            .attr('y2', 15)
            .attr("stroke-width", 4)
            .attr("stroke", "#e6afd3")
        svg.append('text')
            .attr('y', 20)
            .attr('x', 25)
            .text('1 ROOM');
        svg.append("line")
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 35)
            .attr('y2', 35)
            .attr("stroke-width", 4)
            .attr("stroke", "#71cdeb")
        svg.append('text')
            .attr('y', 40)
            .attr('x', 25)
            .text('5 ROOM');
        svg.append("line")
            .attr('x1', 155)
            .attr('x2', 175)
            .attr('y1', 15)
            .attr('y2', 15)
            .attr("stroke-width", 4)
            .attr("stroke", "#8adbd3")
        svg.append('text')
            .attr('y', 20)
            .attr('x', 185)
            .text('2 ROOM');
        svg.append("line")
            .attr('x1', 155)
            .attr('x2', 175)
            .attr('y1', 35)
            .attr('y2', 35)
            .attr("stroke-width", 4)
            .attr("stroke", "#a7dab0")
        svg.append('text')
            .attr('y', 40)
            .attr('x', 185)
            .text('EXECUTIVE');
        svg.append('line')
            .attr('x1', 300)
            .attr('x2', 320)
            .attr('y1', 15)
            .attr('y2', 15)
            .attr("stroke-width", 4)
            .attr("stroke", "#e6b197")
        svg.append('text')
            .attr('y', 20)
            .attr('x', 330)
            .text('3 ROOM');
        svg.append('line')
            .attr('x1', 300)
            .attr('x2', 320)
            .attr('y1', 35)
            .attr('y2', 35)
            .attr("stroke-width", 4)
            .attr("stroke", "#aebaeb")
        svg.append('text')
            .attr('y', 40)
            .attr('x', 330)
            .text('MULTI-GENERATION');
        svg.append('line')
            .attr('x1', 430)
            .attr('x2', 450)
            .attr('y1', 15)
            .attr('y2', 15)
            .attr("stroke-width", 4)
            .attr("stroke", "#d2d39d")
        svg.append('text')
            .attr('y', 20)
            .attr('x', 465)
            .text('4 ROOM');
    }

    update() {
        let vis = this;

        vis.filteredData = vis.data;
        if (vis.regionFocus != undefined) vis.filteredData = vis.data.filter(t => t.town == vis.regionFocus);
        let groupData = vis.filteredData.reduce((group, datum) => {
            group[datum.year] = group[datum.year] ?? [];
            group[datum.year].push(datum);
            return group;
        }, {})

        vis.groupData = [];
        Object.entries(groupData).forEach(([key, val], _) => {
            let processedVal = val;
            if (vis.regionFocus == undefined) {
                let typeGroup = val.reduce((group, datum) => {
                    group[datum.type] = group[datum.type] ?? [];
                    group[datum.type].push(datum);
                    return group;
                }, {})
                let tg = []
                Object.entries(typeGroup).forEach(([t, v], _) => {
                    tg.push({
                        year: key,
                        town: "SINGAPORE",
                        type: t,
                        avg_price_per_sqm: Math.round(v.reduce((acc, r) => acc + r.avg_price_per_sqm, 0) / v.length)
                    })
                })
                processedVal = tg;
            }
            vis.groupData.push({
                "year": key,
                "data": processedVal
            })
        })

        let dataForMaxY = vis.filteredData;
        if (vis.regionFocus == undefined) {
            let allData = [];
            vis.groupData.forEach(t => {
                t.data.forEach(tt => allData.push(tt))
            })
            dataForMaxY = allData;
        }

        vis.yValue = d => d["avg_price_per_sqm"];

        vis.xScale = d3.scaleBand()
            .domain(vis.filteredData.map(vis.xValue))
            .range([0, vis.width])
            .padding(0.2);
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSize(-vis.height)
            .tickPadding(5);

        // let typeGroup = vis.filteredData.map(vis.subXValue).sort((a, b) => vis.typeSet.indexOf(a) - vis.typeSet.indexOf(b));
        vis.xSubScale = d3.scaleBand()
            .domain(vis.typeSet)
            .range([0, vis.xScale.bandwidth()])
            .padding(0.05);
        vis.xSubColor = d3.scaleOrdinal()
            .domain(vis.typeSet)
            .range(vis.colorSet);

        let maxHeight = d3.max(dataForMaxY, d => vis.yValue(d));
        let adjustedMaxHeight = Math.floor(maxHeight / 100) * 100;
        vis.yScale.domain([0, adjustedMaxHeight + (adjustedMaxHeight + 100 - maxHeight <= 50 && adjustedMaxHeight !== maxHeight ? 200 : 100)]);

        vis.render();
    }

    render() {
        let vis = this;

        vis.axisG.call(vis.xAxis).attr('transform', `translate(0,${vis.height})`);
        vis.axisG.call(g => g.selectAll("line").remove());
        vis.axisY.transition().duration(500).call(vis.yAxis).call(g => g.selectAll("line").attr("style", "color: #D3D3D3"))
        vis.chart.selectAll(".group_part").remove()

        vis.chart.selectAll(".part").data(vis.groupData).enter().append("g").attr("class", "group_part")
            .attr("transform", d => `translate(${vis.xScale(vis.xValue(d))},0)`)
            .selectAll("rect").data(d => d.data).enter().append("rect")
            .attr('id', d => `${d.town}_${d.year}_${d.type}`.split(" ").join(""))
            .attr('x', d => vis.xSubScale(vis.subXValue(d)))
            .attr('y', d => vis.yScale(vis.yValue(d)))
            .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
            .attr('width', vis.xSubScale.bandwidth())
            .attr('fill', d => vis.xSubColor(d.type))
            .attr("title", d => d.type)
            .on("mouseover", d => d3.select(`#${d.town}_${d.year}_${d.type}`.split(" ").join("")).style("stroke", "#000"))
            .on("mouseout", d => d3.select(`#${d.town}_${d.year}_${d.type}`.split(" ").join("")).style("stroke", null))
            .append("svg:title")
            .text(d => d.avg_price_per_sqm);;
    }
}
