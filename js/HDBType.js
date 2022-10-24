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
        vis.regionFocus = "YISHUN";

		let svg = d3.select(vis.config.parentElement).attr("width", vis.config.containerWidth).attr("height", vis.config.containerHeight);
		vis.chart = svg.append("g").attr('transform', `translate(${75},${vis.config.margin.top})`);

		vis.chart.append('text')
			.attr('class', 'axis-label')
			.attr('y', -45)
			.attr('x', -vis.height / 2)
			.attr('transform', `rotate(-90)`)
			.attr('text-anchor', 'middle')
			.text('Average Price Per Square Meter');
			
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
					
		// vis.chart.append('g').call(vis.yAxis).call(g => g.selectAll("line").attr("style", "color: #D3D3D3"));
		vis.axisY = vis.chart.append('g');
		vis.axisG = vis.chart.append('g');
    }

    update() {
        let vis = this;

        vis.filteredData = vis.data;
        if (vis.regionFocus != undefined) vis.filteredData = vis.data.filter(t => t.town == vis.regionFocus);
        else {
            
        }
        let groupData = vis.filteredData.reduce((group, datum) => {
            group[datum.year] = group[datum.year] ?? [];
            group[datum.year].push(datum);
            return group;
        }, {})
        vis.groupData = [];
        Object.entries(groupData).forEach(([key, val], _) => {
            vis.groupData.push({
                "year": key,
                "data": val
            })
        })

		// vis.filteredData = vis.data;
		// if (vis.year !== undefined) vis.filteredData = vis.data.filter(d => d.year === vis.year);
		// vis.sortedData = vis.filteredData.sort((x, y) => d3.ascending(x.Date, y.Date));

		// vis.filteredDogData = vis.dogData;
		// if (vis.year !== undefined) vis.filteredDogData = vis.dogData.filter(d => d.year === vis.year);
		// vis.sortedDogData = vis.filteredDogData.sort((x, y) => d3.ascending(x.Date, y.Date));

		vis.yValue = d => d["avg_price_per_sqm"];

		vis.xScale = d3.scaleBand()
				.domain(vis.filteredData.map(vis.xValue))
				.range([0, vis.width])
				.padding(0.2);
		vis.xAxis = d3.axisBottom(vis.xScale)
				.tickSize(-vis.height)
				.tickPadding(5);

        let typeGroup = vis.filteredData.map(vis.subXValue);
        vis.xSubScale = d3.scaleBand()
                .domain(typeGroup)
                .range([0, vis.xScale.bandwidth()])
                .padding(0.05);
        vis.xSubColor = d3.scaleOrdinal()
                .domain(typeGroup)
                .range(vis.colorSet.slice(0, typeGroup.lenght));

		let maxHeight = d3.max(vis.filteredData, d => vis.yValue(d));
		let adjustedMaxHeight = Math.floor(maxHeight / 100) * 100;
		vis.yScale.domain([0, adjustedMaxHeight + (adjustedMaxHeight + 100 - maxHeight <= 50 && adjustedMaxHeight !== maxHeight ? 200 : 100)]);
				
		vis.render();
    }

    render() {
        let vis = this;
        
        vis.axisG.transition().duration(500).call(vis.xAxis).attr('transform', `translate(0,${vis.height})`);
		vis.axisG.call(g => g.selectAll("rect").remove());
        vis.axisY.transition().duration(500).call(vis.yAxis).call(g => g.selectAll("line").attr("style", "color: #D3D3D3"))

        vis.chart.selectAll(".part").data(vis.groupData).enter().append("g").attr("class", "group_part")
            .attr("transform", d => `translate(${vis.xScale(vis.xValue(d))},0)`)
            .selectAll("rect").data(d => d.data).enter().append("rect")
            .attr('id', d => `${d.town}_${d.year}_${d.type}`)
            .attr('x', d => vis.xSubScale(vis.subXValue(d)))
            .attr('y', d => vis.yScale(vis.yValue(d)))
            .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
            .attr('width', vis.xSubScale.bandwidth())
            .attr('fill', d => vis.xSubColor(d.type));
    }
}
