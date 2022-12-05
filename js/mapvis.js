/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */

class MapVis {

    constructor(parentElement, data, geoData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.data = data;
        this.unicorn_array = [];
        this.data.forEach(d=>{
                this.unicorn_array[d['Country']] = d['Unicorns']
            }
        )

        // define colors
        this.colors = ['#d9d9d9', 'rgb(170,170,170)']

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 50, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .text('')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // add color legend
        vis.mapScale = d3.scaleLinear()
            .range(vis.colors)
            .domain([0, 7])

        vis.svg.append("rect")
            .attr("x",-vis.width)
            .attr("y",-vis.height-100)
            .attr("width", vis.width*4)
            .attr("height", vis.height*3.2)
            .attr("fill", "black")
            .attr("opacity", 1);

        vis.svg.append("text")
            .attr('class', "h5")
            .attr("x",vis.width/2)
            .attr("y",-vis.height-50)
            .attr("fill", "white")
            .attr("opacity", 1)
            .style("font-size", 27)
            .attr('text-anchor','middle')
            .text("Global Unicorn Sightings");

        vis.svg.append("text")
            .attr("x",vis.width/2)
            .attr("y",-vis.height-10)
            .attr("fill", "white")
            .attr("opacity", 1)
            .attr('text-anchor','middle')
            .text("While learning more about the nature of unicorns can be intriguing, but it's even more ");

        vis.svg.append("text")
            .attr("x",vis.width/2)
            .attr("y",-vis.height+15)
            .attr("fill", "white")
            .attr("opacity", 1)
            .attr('text-anchor','middle')
            .text("exciting to discover where these unicorns can be found. Hover the cursor over the map ");

        vis.svg.append("text")
            .attr("x",vis.width/2)
            .attr("y",-vis.height+40)
            .attr("fill", "white")
            .attr("opacity", 1)
            .attr('text-anchor','middle')
            .text("to discover which countries lead the world in unicorn population.");

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')

        // d3.geoOrthographic()
        vis.rotate = [0, 0]
        vis.zoom = vis.height / 300;

        // Change display
        vis.projection = d3.geoNaturalEarth1() // d3.geoStereographic()
            .translate([vis.width / 2, vis.height / 3])
            .scale(230 * vis.zoom) // 249.5 is default. so multiply that by your zoom
            .rotate(vis.rotate);

        // path provider
        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.svg.append("path")
            .datum(
                {type: "Sphere"}
            )
            .attr("class", "graticule")
            .attr('fill', '#FFFFFF')
            .attr("stroke", "#FFFFFF")
            .attr("d", vis.path);

        vis.svg.append("path")
            .datum(d3.geoGraticule())
            .attr("class", "graticule")
            .attr('fill', '#FFFFFF')
            .attr("stroke", "#FFFFFF")
            .attr("d", vis.path);

        // Convert TopoJSON to GeoJSON (target object = 'states')
        let world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features

        vis.countries = vis.svg.selectAll(".country")
            .data(world)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)

        let m0,
            o0;

        let legendColors = [
            {industry:'Number of Unicorns',color:'#000000', id:5},
            {industry:'',color:'#000000', id:5},
            {industry:'0',color:'#DCDCDC', id:5},
            {industry:'1',color:'#d3d3d3', id:3},
            {industry:'2',color:'#C8C8C8', id:7},
            {industry:'3',color:'#BEBEBE', id:6},
            {industry:'4',color:'#B0B0B0', id:1},
            {industry:'5',color:'#A8A8A8', id:4},
            {industry:'6',color:'#989898', id:2},
            {industry:'7',color:'#888888', id:9},
            {industry:'12',color:'#707070', id:8},
            {industry:'16',color:'#686868', id:0},
            {industry:'19',color:'#585858', id:0},
            {industry:'20',color:'#484848', id:0},
            {industry:'24',color:'#383838', id:0},
            {industry:'42+',color:'#000000', id:0}]

        vis.svg.selectAll("mydots")
            .data(legendColors)
            .enter()
            .append("rect")
            .attr('width', 40)
            .attr('height', 20)
            .attr("x", (d, i) => vis.width/30 + i * vis.width/16)
            .attr("y", vis.height * 1.6)
            .style("stroke", (d, i) => {
                if(i > 1) {return "white";} else {return "black";}
            })
            .attr('fill', d => d.color)

        vis.svg.selectAll("mylabels")
            .data(legendColors)
            .enter()
            .append("text")
            .attr('x', (d, i) => vis.width/30 + 20 + i * vis.width/16)
            .attr('y', vis.height * 1.6 - 15)
            .style("fill", "white")
            .text(function(d){return d.industry + "\n"})
            .attr("text-anchor", "middle")
            .style("alignment-baseline", "middle")

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;


        // create random data structure with information for each land
        vis.countryInfo = {};
        vis.geoData.objects.countries.geometries.forEach(d => {
            //let numberOfUnicorns = vis.airportData.nodes[d.source].unicorns
            let numberOfUnicorns = Math.random() * 4
            vis.countryInfo[d.properties.name] = {
                name: d.properties.name,
                category: 'category_' + Math.floor(numberOfUnicorns),
                color: vis.mapScale(vis.unicorn_array[d.properties.name]),
                value: numberOfUnicorns / 4 * 100
            }
        })

        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.countries
            .on('mouseover', function (event, d) {
                selectedCountry = d.properties.name
                d3.select(this)
                    .attr("fill", '#bf80ff')
                let unicorns = "";
                if(d.properties.name in vis.unicorn_array) {
                    unicorns = vis.unicorn_array[d.properties.name];
                } else {
                    unicorns = 0;
                }
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div style="border: thin solid #bf80ff; border-radius: 5px; background: #f2e6ff; padding: 20px">
                            <h3>${d.properties.name}<h3> 
                            <h6>Number of Unicorns: ${unicorns}</h6>
                        </div>`);

            })
            .on('mouseout', function (event, d) {
                selectedCountry = ''
                d3.select(this)
                    .attr('fill', d => vis.countryInfo[d.properties.name].color)
                    .attr("stroke", 'white')
                    .attr("stroke-width", 0.5)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0 + "px")
                    .style("top", 0 + "px")
            })
            .transition()
            .duration(500)
            .attr('fill', d => vis.countryInfo[d.properties.name].color)
            .attr("stroke", 'white')
            .attr("stroke-width", 0.5)
    }
}