let regionMap = new RegionMap({ parentElement: "#project-map", containerWidth: 600, containerHeight: 450 });
let typeGraph = new HDBType({ parentElement: "#project-type", containerWidth: 600, containerHeight: 450 });
let lineGraph = new LineGraph({ parentElement: "#project-line", containerWidth: 600, containerHeight: 450 });
let sizeGraph = new SizeGraph({ parentElement: "#project-size", containerWidth: 1860, containerHeight: 400 });

let jsonMapping = {};
jsonMapping["2017-"] = { file: "resale-flat-prices-based-on-registration-date-from-jan-2017-onwards.csv" };
jsonMapping["2015-2016"] = { file: "resale-flat-prices-based-on-registration-date-from-jan-2015-to-dec-2016.csv" };
jsonMapping["2012-2014"] = { file: "resale-flat-prices-based-on-registration-date-from-mar-2012-to-dec-2014.csv" };

Promise.all([
    d3.csv('data/' + jsonMapping["2017-"].file),
    d3.csv('data/' + jsonMapping["2015-2016"].file),
    d3.csv('data/' + jsonMapping["2012-2014"].file)
]).then(files => {
    let t = [...files[2], ...files[1], ...files[0]];
    let dataset = getDataset(t);
    let uniqueTowns = [...new Set(dataset.map(item => item.town))]
    let processedDataType = processDataType(dataset);
    let processedDataDate = processDataDate(dataset);
    let processedDataSize = processDataSize(dataset);
    
    regionMap.validRegion = uniqueTowns;
    typeGraph.data = processedDataType;
    lineGraph.data = processedDataDate;
    sizeGraph.data = processedDataSize
    
    regionMap.update();
    typeGraph.update();
    lineGraph.update();
    sizeGraph.update();
});

//d3.csv("data/" + jsonMapping["2017-"].file).then(t => {
//  let dataset = getDataset(t);
//  let uniqueTowns = [...new Set(dataset.map(item => item.town))]
//  let processedDataType = processDataType(dataset);
//  let processedDataDate = processDataDate(dataset);
//  let processedDataSize = processDataSize(dataset);
//
//  regionMap.validRegion = uniqueTowns;
//  typeGraph.data = processedDataType;
//  lineGraph.data = processedDataDate;
//  sizeGraph.data = processedDataSize
//
//  regionMap.update();
//  typeGraph.update();
//  lineGraph.update();
//  sizeGraph.update();
//})

function getDatum(entry) {
    let price = +entry.resale_price;
    let size = +entry.floor_area_sqm;
    let year = +(entry.month.split("-")[0])
    return datum = {
        month: entry.month,
        town: entry.town,
        type: entry.flat_type,
        size: size,
        price: price,
        lease: entry.lease_commence_date,
        price_per_sqm: Math.round(price / size),
        year: year
    }
}

function getDataset(data) {
    let dataset = []
    data.forEach(t => {
        dataset.push(getDatum(t));
    })
    return dataset;
}

// Type based
function processDataType(dataset) {
    let regionData = dataset.reduce((group, datum) => {
        group[datum.town] = group[datum.town] ?? [];
        group[datum.town].push(datum);
        return group;
    }, {})
    let preProcessData = {}
    Object.entries(regionData).forEach(([key, value], _) => {
        let typeBasedResult = getTypeBasedData(value);
        let typeBasedResultAsList = Object.keys(typeBasedResult).reduce((res, val) => res.concat(typeBasedResult[val]), [])
        preProcessData[key] = typeBasedResultAsList;
    })
    return Object.keys(preProcessData).reduce((res, val) => res.concat(preProcessData[val]), [])
}

function getTypeBasedData(data) {
    let grouped = data.reduce((group, datum) => {
        group[datum.type] = group[datum.type] ?? [];
        group[datum.type].push(datum);
        return group;
    }, {})
    let result = {};
    Object.entries(grouped).forEach(([key, value], _) => result[key] = Object.values(getYearBasedData(value)));
    return result;
}

function getYearBasedData(data) {
    let grouped = data.reduce((group, datum) => {
        group[datum.year] = group[datum.year] ?? [];
        group[datum.year].push(datum);
        return group;
    }, {})
    let result = {};
    Object.entries(grouped).forEach(([key, value], _) => {
        result[key] = {
            year: key,
            town: value[0].town,
            type: value[0].type,
            avg_price_per_sqm: Math.round(value.reduce((acc, datum) => acc + datum.price_per_sqm, 0) / value.length)
        };
    })
    return result;
}

// Date based
function processDataDate(dataset) {
    let regionData = dataset.reduce((group, datum) => {
        group[datum.town] = group[datum.town] ?? [];
        group[datum.town].push(datum);
        return group;
    }, {})
    let preProcessData = {}
    Object.entries(regionData).forEach(([key, value], _) => {
        let monthBasedResult = getMonthBasedData(value);
        let monthBasedResultAsList = Object.keys(monthBasedResult).reduce((res, val) => res.concat(monthBasedResult[val]), [])
        preProcessData[key] = monthBasedResultAsList;
    })
    return Object.keys(preProcessData).reduce((res, val) => res.concat(preProcessData[val]), [])
}

function getMonthBasedData(data) {
    let grouped = data.reduce((group, datum) => {
        group[datum.month] = group[datum.month] ?? [];
        group[datum.month].push(datum);
        return group;
    }, {})
    let result = {};
    Object.entries(grouped).forEach(([key, value], _) => {
        result[key] = {
            month: key,
            town: value[0].town,
            avg_price_per_sqm: Math.round(value.reduce((acc, datum) => acc + datum.price_per_sqm, 0) / value.length)
        };
    })
    return result;
}

// Size based
function processDataSize(dataset) {
    let regionData = dataset.reduce((group, datum) => {
        group[datum.town] = group[datum.town] ?? [];
        group[datum.town].push(datum);
        return group;
    }, {})
    let preProcessData = {}
    Object.entries(regionData).forEach(([key, value], _) => {
        let sizeBasedResult = getSizeBasedData(value);
        let sizeBasedResultAsList = Object.keys(sizeBasedResult).reduce((res, val) => res.concat(sizeBasedResult[val]), [])
        preProcessData[key] = sizeBasedResultAsList;
    })
    return Object.keys(preProcessData).reduce((res, val) => res.concat(preProcessData[val]), [])
}

function getSizeBasedData(data) {
    let grouped = data.reduce((group, datum) => {
        group[datum.size] = group[datum.size] ?? [];
        group[datum.size].push(datum);
        return group;
    }, {})
    let result = {};
    Object.entries(grouped).forEach(([key, value], _) => result[key] = Object.values(getSizeYearBasedData(value)));
    return result;
}

function getSizeYearBasedData(data) {
    let grouped = data.reduce((group, datum) => {
        group[datum.year] = group[datum.year] ?? [];
        group[datum.year].push(datum);
        return group;
    }, {})
    let result = {};
    Object.entries(grouped).forEach(([key, value], _) => {
        result[key] = {
            year: key,
            town: value[0].town,
            size: value[0].size,
            price: Math.round(value.reduce((acc, datum) => acc + datum.price, 0) / value.length)
        };
    })
    return result;
}

// Interaction
function onRegionSelect(name) {
    $("#size-graph-title-text").text(`Average Resale Price For Different Sizes In ${name ?? "SINGAPORE"} In `)
    typeGraph.regionFocus = name;
    lineGraph.regionFocus = name;
    sizeGraph.regionFocus = name;
    typeGraph.update();
    lineGraph.update();
    sizeGraph.update();
}

$("#size-graph-title-select").on("change", function () {
    sizeGraph.year = +$(this).val();
    sizeGraph.update();
});
