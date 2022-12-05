class CircleVis {

    constructor(parentElement, data, industryColors) {
        this.parentElement = parentElement;
        this.data = data;
        this.industryColors = industryColors
        this.displayData = [];

        this.initVis();
    }

    initVis(){
        let vis = this;

        // Create the svg and positioning components
        vis.margin = {bottom: 10, top: 10, right: 10, left: 10}

        vis.width = document.getElementById('circles').getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById('circles').getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select('#' + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'Tooltip')

        // Scale for circles area
        vis.circleRad = d3.scaleSqrt()
            .range([0, 20]);

        // Create separate svg for the circle size scale
        let margin2 = {bottom: 10, top: 10, right: 10, left: 10}

        let width2 = document.getElementById('circleLeg').getBoundingClientRect().width - margin2.left - margin2.right;
        let height2 = document.getElementById('circleLeg').getBoundingClientRect().height - margin2.top - margin2.bottom;

        vis.svg2 = d3.select('#circleLeg').append("svg")
            .attr("width", width2 + margin2.left + margin2.right)
            .attr("height", height2 + margin2.top + margin2.bottom)
            .append("g")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        // Circle radius sizes for legend
        vis.legendCircleRadii = [5,10,15,20]

        // Append cicles to the legend
        vis.legCircles = vis.svg2.selectAll("legend-circle")
            .data(vis.legendCircleRadii)
            .enter()
            .append("circle")
            .attr('class', 'legend-circle')
            .attr("cx", (d,i) => width2/4*i)
            .attr("cy", height2/2)
            .attr("r", d => d)
            .style("stroke", 'white')
            .style("fill", "white" )
            .style('opacity',1)
            .style("stroke-width", 1);

        // Create a scale for the valuation
        vis.valScale = d3.scaleOrdinal().range([0,width2])

        vis.valAxis = d3.axisBottom()
            .scale(vis.valScale)
            .tickFormat(x => x);

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this;

        //filter Data by selected country
        vis.displayData = vis.data.filter((f) => f.Country === selectedCountry)

        // Provides number of companies per industry
        let count = Array.from(d3.rollup(vis.displayData, f => f.length, f => f.Industry),([industry,count])=>({industry,count}))

        // Add industry count to industry colors
        // if count is zero make it a large number so that it will be one of the invisible outer circles
        vis.industryColors.forEach(function(d,) {
            if (count.filter(e => e.industry === d.industry).length > 0) {
                /* vendors contains the element we're looking for */
                d['count'] = count.find(e => e.industry === d.industry).count;
            }
            else {
                d['count'] = 2000
            }
        })
        // Sort industry colors by count in descending order
        vis.industryColors.sort((a,b) => d3.descending(a.count, b.count))

        // Dynamically generate background circle radius based on div width
        vis.circleRadii= []
        vis.industryColors.forEach(function(d,i) {
            vis.circleRadii.push(((vis.width/2.5)/10) * (10-i))
        })

        // Append background circle radius to industry colors
        vis.industryColors.forEach(function (d,i) {
            d['radius'] = vis.circleRadii[i]
        })

        // get x and y coordinates for company circles using
        let coordinates = []
        vis.counter = 0
        vis.industryColors.forEach(function (d) {
            if (d.count != 2000) {
                vis.counter += 1
            }
        })
        let offset = 360/vis.counter
        vis.industryColors.forEach(function(d,index){

            if (d.count != 2000) {
                for (let i = 0; i < d.count; i++) {
                    let theta = (360 / d.count) * (i) + (offset * index) //+ 5 * index)
                    let cord = {
                        x: (d.radius * Math.cos(theta * (Math.PI / 180))) + vis.width / 2,
                        y: (d.radius * Math.sin(theta * (Math.PI / 180))) + vis.height / 2.25
                    }
                    coordinates.push(cord)
                }
            }
        })

        // Create an ordered list of industries by count
        let sortedIndustries = vis.industryColors.map(d => d.industry)

        // Sort country data by industry according to sorted industry and company valuation
        this.displayData.sort((a, b) => (sortedIndustries.indexOf(a.Industry) - sortedIndustries.indexOf(b.Industry) || a['Valuation ($B)'] -  b['Valuation ($B)']));

        // Append (x,y) coordinates and color to each company observation
        this.displayData.forEach(function(d,index){
            d['x'] = coordinates[index].x
            d['y'] = coordinates[index].y
            d['color'] = vis.industryColors.find(c => c.industry === d.Industry).color
        })

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // set the domain of the circle radius based on max valuation of company within selected country
        vis.circleRad.domain([0, d3.max(vis.displayData, d => d['Valuation ($B)'])]);

        // Create axis for circle size scale
        let invertedLegCircles = [0]
        vis.legendCircleRadii.forEach(d => invertedLegCircles.push(Math.round(vis.circleRad.invert(d))))
        vis.valScale.domain(invertedLegCircles)
        vis.svg2.select(".val-axis").call(vis.valAxis);

        // time formatter for tool tip
        let formatTime = d3.timeFormat("%m/%d/%y")

        // Creates grey background circles for each industry
        vis.bgCircles = vis.svg.selectAll(".bgCircles")
            .data(vis.circleRadii.slice(-vis.counter));

        vis.bgCircles.exit().remove()

        vis.bgCircles.enter()
            .append("circle")
            .attr('class',"bgCircles")
            .merge(vis.bgCircles)
            .attr("cx", vis.width/2)
            .attr("cy", vis.height/2.25)
            .transition()
            .attr("r", d => d)
            .style("stroke", 'grey')
            .style("fill", "none" )
            .style('opacity', .4)
            .style("stroke-width", 1);

        // Appends circles to svg for all companies within a country
        vis.ctryCircles = vis.svg.selectAll(".ctryCircles")
            .data(vis.displayData)

        vis.ctryCircles.exit().remove()

        vis.ctryCircles.enter()
            .append("circle")
            .attr('class', 'ctryCircles')
            .merge(vis.ctryCircles)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr('fill', d => d.color)
            .attr('stroke', d => d.color)
            .attr('opacity', 0.8)
            .attr('r', d => vis.circleRad(d['Valuation ($B)']))

        // Appends opaque circles on top of current circles to help use select circles of smaller area
        vis.clickCircles = vis.svg.selectAll(".clickCircles")
            .data(vis.displayData)

        vis.clickCircles.exit().remove()

        vis.clickCircles.enter()
            .append("circle")
            .attr('class', 'clickCircles')
            .merge(vis.clickCircles)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr('fill', d => d.color)
            .attr('stroke', d => d.color)
            .attr('opacity', 0)
            .attr('r', function (d) {
                if (vis.circleRad(d['Valuation ($B)']) < 6) {
                    return 6
                }
                else {
                    return vis.circleRad(d['Valuation ($B)'])
                }
            })
            .on('mouseover', function (event, d) {
                vis.circleHover(d[""])
                if (d.x < vis.width/2 && d.y < vis.height/2) {
                    vis.tooltip.style("opacity", 1)
                        .style('right',5+ '%')
                        .style("left", event.pageX -30 +"px")
                        .style("top", event.pageY+ "px")
                        .html(`
                     <div style="border: thin solid #bf80ff; border-radius: 5px; background:  #f2e6ff; padding: 20px">
                     <h6><strong><center>${d.Company}</center></strong></h6>
                     <h6><strong>Valuation ($B): </strong>${d['Valuation ($B)']}</h6>
                     <h6><strong>Location: </strong>${d.City}, ${d.Country}</h6>
                     <h6><strong>Select Investors: </strong>${d['Select Inverstors']}</h6>
                     <h6><strong>Year Founded: </strong>${d['Founded Year']}</h6>
                     <h6><strong>Date Joined: </strong>${formatTime(d['Date Joined'])}</h6>
                     </div>`);
                }
                else if (d.x>vis.width/2 && d.y < vis.height/2) {
                    vis.tooltip.style("opacity", 1)
                        .style('right', 5 + '%')
                        .style('left', vis.width*1.5+'px')
                        .style("top", event.pageY+ "px")
                        .html(`
                     <div style="border: thin solid #bf80ff; border-radius: 5px; background:  #f2e6ff; padding: 20px">
                     <h6><strong><center>${d.Company}</center></strong></h6>
                     <h6><strong>Valuation ($B): </strong>${d['Valuation ($B)']}</h6>
                     <h6><strong>Location: </strong>${d.City}, ${d.Country}</h6>
                     <h6><strong>Select Investors: </strong>${d['Select Inverstors']}</h6>
                     <h6><strong>Year Founded: </strong>${d['Founded Year']}</h6>
                     <h6><strong>Date Joined: </strong>${formatTime(d['Date Joined'])}</h6>
                     </div>`);
                }
                else if (d.x < vis.width/2 && d.y > vis.height/2) {
                    vis.tooltip.style("opacity", 1)
                        .style('right', 5 + '%')
                        .style('left', event.pageX +"px")
                        .style("top", event.pageY - vis.height/3+ "px")
                        .html(`
                     <div style="border: thin solid #bf80ff; border-radius: 5px; background:  #f2e6ff; padding: 20px">
                     <h6><strong><center>${d.Company}</center></strong></h6>
                     <h6><strong>Valuation ($B): </strong>${d['Valuation ($B)']}</h6>
                     <h6><strong>Location: </strong>${d.City}, ${d.Country}</h6>
                     <h6><strong>Select Investors: </strong>${d['Select Inverstors']}</h6>
                     <h6><strong>Year Founded: </strong>${d['Founded Year']}</h6>
                     <h6><strong>Date Joined: </strong>${formatTime(d['Date Joined'])}</h6>
                     </div>`);
                }
                else{
                    vis.tooltip.style("opacity", 1)
                        .style('right', 5 + '%')
                        .style('left', vis.width*1.5+'px')
                        .style("top", event.pageY - vis.height/3+ "px")
                        .html(`
                     <div style="border: thin solid #bf80ff; border-radius: 5px; background:  #f2e6ff; padding: 20px">
                     <h6><strong><center>${d.Company}</center></strong></h6>
                     <h6><strong>Valuation ($B): </strong>${d['Valuation ($B)']}</h6>
                     <h6><strong>Location: </strong>${d.City}, ${d.Country}</h6>
                     <h6><strong>Select Investors: </strong>${d['Select Inverstors']}</h6>
                     <h6><strong>Year Founded: </strong>${d['Founded Year']}</h6>
                     <h6><strong>Date Joined: </strong>${formatTime(d['Date Joined'])}</h6>
                     </div>`);
                }
            })
            .on('mouseout', function (event, d) {
                vis.circleUnhover()
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
    }

    // Highlights circle when hovering
    circleHover(index){
        let vis = this;
        vis.ctryCircles = vis.svg.selectAll(".ctryCircles")
            .data(vis.displayData)

        vis.ctryCircles.exit().remove()

        vis.ctryCircles.enter()
            .append("circle")
            .attr('class', 'ctryCircles')
            .merge(vis.ctryCircles)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr('fill', function(d) {
                if (d[""] === index) {
                    return 'white'
                }
                else {
                    return d.color
                }
            })
            .attr('stroke', function(d) {
                if (d[""] === index) {
                    return 'white'
                }
                else {
                    return d.color
                }
            })
            .attr('opacity', function(d) {
                if (d[""] === index) {
                    return 1
                }
                else {
                    return 0.8
                }
            })
            .attr('r', d => vis.circleRad(d['Valuation ($B)']))
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .attr('stroke', 'white')
                    .attr('fill', 'white')
                    .attr('stroke-width',3)
                    .attr('opacity', 1)
            })
    }

    // Un-highlights circle when no longer hovering
    circleUnhover(){
        let vis = this;
        vis.ctryCircles = vis.svg.selectAll(".ctryCircles")
            .data(vis.displayData)

        vis.ctryCircles.exit().remove()

        vis.ctryCircles.enter()
            .append("circle")
            .attr('class', 'ctryCircles')
            .merge(vis.ctryCircles)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr('fill', d => d.color)
            .attr('stroke', d => d.color)
            .attr('opacity', 0.8)
            .attr('r', d => vis.circleRad(d['Valuation ($B)']))
    }
}
