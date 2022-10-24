let regionMap = new RegionMap({ parentElement: "#project-map", containerWidth: 600, containerHeight: 450 });
let typeGraph = new HDBType({ parentElement: "#project-type", containerWidth: 600, containerHeight: 450 });

let jsonMapping = {};
jsonMapping["2017-"] = {file: "resale-flat-prices-based-on-registration-date-from-jan-2017-onwards.csv"};

regionMap.render();

d3.csv("data/" + jsonMapping["2017-"].file).then(t => {
    let dataset = getDataset(t);
    console.log(dataset)
    let processedData = processData(dataset);
    
    typeGraph.data = processedData;

    regionMap.update();
    typeGraph.update();
})

function processData(dataset) {
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

function getDataset(data) {
    let dataset = []
    data.forEach(t => {
        dataset.push(getDatum(t));
    })
    return dataset;
}

function getDatum(entry) {
    let price = +entry.resale_price;
    let size = +entry.floor_area_sqm;
    let year = +(entry.month.split("-")[0])
    return datum = {
        // month: entry.month,
        town: entry.town,
        type: entry.flat_type,
        size: size,
        price: price,
        lease: entry.lease_commence_date,
        price_per_sqm: Math.round(price / size),
        year: year
    }
}

function getTypeBasedData(data) {
    let grouped = data.reduce((group, datum) => {
        group[datum.type] = group[datum.type] ?? [];
        group[datum.type].push(datum);
        return group;
    }, {})
    let result = {};
    Object.entries(grouped).forEach(([key, value], _) => result[key] = Object.values(getTimeBasedData(value)));
    return result;
}

function getTimeBasedData(data) {
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
