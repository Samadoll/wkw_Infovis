let regionMap = new RegionMap({ parentElement: "#project-map", containerWidth: 600, containerHeight: 400 });
let typeGraph = new HDBType({ parentElement: "#project-type", containerWidth: 600, containerHeight: 450 });
let lineGraph = new LineGraph({ parentElement: "#project-line", containerWidth: 600, containerHeight: 450 });

let jsonMapping = {};
jsonMapping["2017-"] = { file: "resale-flat-prices-based-on-registration-date-from-jan-2017-onwards.csv" };

d3.csv("data/" + jsonMapping["2017-"].file).then(t => {
    let dataset = getDataset(t);
    let processedDataType = processDataType(dataset);
    let processedDataDate = processDataDate(dataset);
    let uniqueTowns = [...new Set(dataset.map(item => item.town))]

    regionMap.validRegion = uniqueTowns;
    typeGraph.data = processedDataType;
    lineGraph.data = processedDataDate;

    regionMap.update();
    typeGraph.update();
    lineGraph.update();

})

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

// Interaction
function onRegionSelect(name) {
    typeGraph.regionFocus = name;
    lineGraph.regionFocus = name;
    typeGraph.update();
    lineGraph.update();
}
