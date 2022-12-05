/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */

/*mapVisNew();

let unicorn_array = [];

function mapVisNew() {
    d3.csv("data/unicorns_per_country.csv", (row) => {
        // convert
        row.Unicorns = +row.Unicorns
        return row
    }).then(csv => {
        let data = csv;
        console.log(data);
        data.forEach(d=>{
                console.log(d);
                unicorn_array[d['Country']] = d['Unicorns']
            }
        )
    })
}
convert string to number*/

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
        //this.colors = ['#d9f2d9', '#9fdf9f', '#2d862d', '#194d19']
        this.colors = ['#d9d9d9', '#969696', '#737373', '#525252', '#000000']

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
            .text('Unicorn Spottings')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // add color legend
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 2.8 / 4 - 250}, ${(vis.height + 100)})`)

        vis.legendScale = d3.scaleLinear()
            .range(vis.colors)
            .domain([0, 4])

        vis.legendAxis = d3.axisBottom()
            .scale(vis.legendScale)
            .ticks(0)


        //rectangle
        const rect = vis.svg.append("rect")
            .attr("x",-vis.width)
            .attr("y", -vis.height)
            .attr("width", vis.width*4)
            .attr("height", vis.height*3)
            .attr("fill", "black")
            .attr("opacity", 1);


        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')

        // d3.geoOrthographic()
        vis.rotate = [0, 0]
        vis.zoom = vis.height / 300;

        // Change display
        vis.projection = d3.geoNaturalEarth1() // d3.geoStereographic()
            .translate([vis.width / 2, vis.height / 2])
            .scale(249.5 * vis.zoom) // 249.5 is default. so multiply that by your zoom
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

        //
        let m0,
            o0;

        vis.wrangleData()

    }

    wrangleData() {
        let vis = this;

        // put unicorn_array here?

        // create random data structure with information for each land
        vis.countryInfo = {};
        vis.geoData.objects.countries.geometries.forEach(d => {
            //let numberOfUnicorns = vis.airportData.nodes[d.source].unicorns
            let numberOfUnicorns = Math.random() * 4
            vis.countryInfo[d.properties.name] = {
                name: d.properties.name,
                category: 'category_' + Math.floor(numberOfUnicorns),
                color: vis.legendScale(vis.unicorn_array[d.properties.name]),
                value: numberOfUnicorns / 4 * 100
            }
        })

        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        console.log(vis.countryInfo)

        vis.countries
            .on('mouseover', function (event, d) {
                console.log(event);
                selectedCountry = d.properties.name
                //circleVis.wrangleData()
                d3.select(this)
                    .attr("fill", '#bf80ff')
                //.attr("stroke", '#bf80ff')
                //.attr("stroke-width", 1)

                //let airport = vis.airportData[Math.floor(Math.random()*vis.airportData.length)]

                console.log(vis.unicorn_array)
                console.log(d)
                console.log(vis.unicorn_array[d.properties.name])
                //if(d.properties.name in vis.unicorn_array){console.log(vis.unicorn_array)}else{console.log("missing")}
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
                /*<h6> Number of Unicorns: ${Math.floor(Math.random()*20)}</h6>*/
                /*<h3>${unicorn_array.Country}<h3>
                <h6>Number of Unicorns: ${unicorn_array.Unicorns}</h6>*/

            })
            .on('mouseout', function (event, d) {
                selectedCountry = ''
                //circleVis.wrangleData()
                d3.select(this)
                    //.attr('fill', d => vis.legendScale(vis.countryInfo[d.properties.name].color))
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
            //.attr('fill', d => vis.legendScale(vis.countryInfo[d.properties.name].color))
            .attr('fill', d => vis.countryInfo[d.properties.name].color)
            .attr("stroke", 'white')
            .attr("stroke-width", 0.5)


        // BONUS

        /*       let airports = vis.svg.selectAll('.airport').data(vis.airportData.nodes)

                airports.exit().remove()
                airports.enter().append('circle')
                    .attr('class', 'airport')
                    .merge(airports)
                    .attr('cx', d => vis.projection([d.longitude, d.latitude])[0])
                    .attr('cy', d => vis.projection([d.longitude, d.latitude])[1])
                    //.attr('cx', d => vis.projection())
                    .attr('r', function (d,i) {
                        return 5
                    })

                let connections = vis.svg.selectAll(".connection")
                    .data(vis.airportData.links)

                connections.exit().remove()
                connections.enter().append("line")
                    .attr("class", "connection")
                    .attr("x1", function(d) { return vis.projection([vis.airportData.nodes[d.source].longitude, vis.airportData.nodes[d.source].latitude])[0]; })
                    .attr("y1", function(d) { return vis.projection([vis.airportData.nodes[d.source].longitude, vis.airportData.nodes[d.source].latitude])[1]; })
                    .attr("x2", function(d) { return vis.projection([vis.airportData.nodes[d.target].longitude, vis.airportData.nodes[d.target].latitude])[0]; })
                    .attr("y2", function(d) { return vis.projection([vis.airportData.nodes[d.target].longitude, vis.airportData.nodes[d.target].latitude])[1]; });
            */
    }
}