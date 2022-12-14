/* * * * * * * * * * * * * *
*           Main           *
* * * * * * * * * * * * * */

loadData()

let parseTime = d3.timeParse("%Y-%m-%d");
let rainbowVis;
let areaVis;
let histoVis;
let myMapVis;
let circleVis;
let selectedCountry = 'United States';
let selectedIndustry ='';

function updateAllVisualizations(){
    myMapVis.wrangleData()
}

// load data using promises
let promises = [
    d3.json("data/world-110m.json"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    d3.csv("data/unicorns_per_country.csv")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(allDataArray) {
    myMapVis = new MapVis('map-chart', allDataArray[3], allDataArray[1])
}

function loadData() {
    d3.csv("data/Unicorn_Companiesv4.csv").then(csv=> {
        csv.forEach(function (d) {
            d[''] = +d[''];
            d['Date Joined'] = parseTime(d['Date Joined'])
            d['Deal Terms'] = +d['Deal Terms']
            // Should this be a number or year?
            d['Founded Year'] = +d['Founded Year']
            d['Investors Count'] = +d['Investors Count']
            d['Portfolio Exits'] = +d['Portfolio Exits']
            d['Total Raised ($B)'] = +d['Total Raised ($B)']
            d['Valuation ($B)'] = +d['Valuation ($B)']
            //number or date?
            d['Year Joined'] = +d['Year Joined']
            d['Years From Founding to Joined'] = +d['Years From Founding to Joined']
        });

        let data = csv;

        let industryColors = [
            {industry:'Artificial intelligence',color:'#fd8acd', id:5},
            {industry:'Consumer retail',color:'#ed1f24', id:3},
            {industry:'Cybersecurity',color:'#ff6700', id:7},
            {industry:'Data management & analytics, Edtech',color:'#fed00d', id:6},
            {industry:'Fintech',color:'#55bb47', id:1},
            {industry:'Health',color:'#066b38', id:4},
            {industry:'Internet software & services, Hardware',color:'#00b3ff', id:2},
            {industry:'Mobile & telecommunications',color:'#0900f9', id:9},
            {industry:'Supply chain, logistics, & delivery',color:'#4b08a1', id:8},
            {industry:'Other',color:'#828085', id:0}]

        rainbowVis = new RainbowVis('rainbow-diagram', data, industryColors)
        areaVis = new AreaChart('area-chart',data,industryColors)
        histoVis = new HistoVis('histo-chart', data, industryColors)
        circleVis = new CircleVis('circle-chart', data, industryColors)
        //mapVis = new MapVis('map-chart',data)

    })};

// This creates the rainbow background
rainbowBackground()

function rainbowBackground() {
    let width = document.getElementById('log').getBoundingClientRect().width;
    let height = document.getElementById('log').getBoundingClientRect().height;
    svg = d3.select("#log").append("svg")
        .attr("width", width)
        .attr('class', 'rbbg')
        .attr("height", height / 3)
        .append("g")
        .attr("transform", "translate(0," + height / 2.8 + ")");

    let colors = ['#fd8acd','#ed1f24','#ff6700','#fed00d','#55bb47', '#066b38','#00b3ff','#0900f9', '#4b08a1']

    rainbowBg = svg.selectAll('rect')
        .data(colors);

    rainbowBg.enter().append('rect')
        .attr('y', (d, index) => (height / 27) * index)
        .attr('x', -width / 2)
        .attr('width', width * 2)
        .attr('height', height / 27)
        .attr('fill', d => d)

    svg.append('svg:image')
        .attr("xlink:href", 'images/unicorn_sketch_black_background.jpg')
        .attr('x', (width - height) / 2)
        .attr('y', -height / 2.8)
        .attr('height', height * .9)
        .attr('width');
}

function countryChange() {
    selectedCountry =  document.getElementById('categorySelector').value;
    circleVis.wrangleData()
}

fixedLegend()

function fixedLegend() {
    let width = document.getElementById('log').getBoundingClientRect().width;
    let industryColors = [
        {industry:'Artificial intelligence',color:'#fd8acd', id:5},
        {industry:'Consumer retail',color:'#ed1f24', id:3},
        {industry:'Cybersecurity',color:'#ff6700', id:7},
        {industry:'Data management & analytics, Edtech',color:'#fed00d', id:6},
        {industry:'Fintech',color:'#55bb47', id:1},
        {industry:'Health',color:'#066b38', id:4},
        {industry:'Internet software & services, Hardware',color:'#00b3ff', id:2},
        {industry:'Mobile & telecommunications',color:'#0900f9', id:9},
        {industry:'Supply chain, logistics, & delivery',color:'#4b08a1', id:8},
        {industry:'Other',color:'#828085', id:0}]

    svg = d3.select("#legend").append("svg")
        .append("g")

    svg.append("rect")
        .attr("x",20)
        .attr("y", 75)
        .attr("width", width/(4.7))
        .attr("height", 380)
        .attr("fill", "gray")
        .style("stroke", "white")
        .style("stroke-width", 5)
        .attr("opacity", .45);

    svg.selectAll("mydots")
        .data(industryColors)
        .enter()
        .append("circle")
        .attr("cx", 45)
        .attr("cy", function(d, i){ return 110 + i*35})
        .attr("r", 10)
        .style("fill", function(d){ return d.color})
        .style("stroke", "black")

    svg.selectAll("mylabels")
        .data(industryColors)
        .enter()
        .append("text")
        .attr("x", 63)
        .attr("y", function(d, i){ return 110 + i*35})
        .style("fill", "white")
        .style("font-weight", 500)
        .text(function(d){return d.industry + "\n"})
        .attr("text-anchor", "right")
        .style("alignment-baseline", "middle")
}

