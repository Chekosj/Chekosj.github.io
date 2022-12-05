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

        let legendColors = [
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

        vis.color = d3.scaleOrdinal()
            .domain(legendColors)
            .range(legendColors);

        // Scale for circles
        vis.circleRad = d3.scaleSqrt()
            .range([0, 20]);

        let margin2 = {bottom: 10, top: 10, right: 10, left: 10}

        let width2 = document.getElementById('circleLeg').getBoundingClientRect().width - margin2.left - margin2.right;
        let height2 = document.getElementById('circleLeg').getBoundingClientRect().height - margin2.top - margin2.bottom;

        vis.svg2 = d3.select('#circleLeg').append("svg")
            .attr("width", width2 + margin2.left + margin2.right)
            .attr("height", height2 + margin2.top + margin2.bottom)
            .append("g")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        vis.legendCircleRadii = [5,10,15,20]

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

        vis.valScale = d3.scaleOrdinal().range([0,width2])

        vis.valAxis = d3.axisBottom()
            .scale(vis.valScale)
            .tickFormat(x => x);


        vis.wrangleData()
    }


    wrangleData(){
        let vis = this;

        //filter Data
        let country = selectedCountry
        // if (selectedCountry === 'United States of America') {
        //     country = 'United States'
        // }
        // else {
        //     country = selectedCountry
        // }
        //console.log('country', country)
        // Filter data to country
        vis.displayData = vis.data.filter((f) => f.Country === country)

        // Provides number of companies per industry
        let count = Array.from(d3.rollup(vis.displayData, f => f.length, f => f.Industry),([industry,count])=>({industry,count}))
        //console.log('COUNT', count)

        // Sort industry colors by count and append circle radius
        vis.industryColors.forEach(function(d,) {
            if (count.filter(e => e.industry === d.industry).length > 0) {
                /* vendors contains the element we're looking for */
                d['count'] = count.find(e => e.industry === d.industry).count;
            }
            else {
                d['count'] = 2000
            }
        })
        // Sort industry colors by count
        vis.industryColors.sort((a,b) => d3.descending(a.count, b.count))

        vis.circleRadii= []
        vis.industryColors.forEach(function(d,i) {
            vis.circleRadii.push(((vis.width/2.1)/10) * (10-i))
        })
        //console.log('radiuses', radiuses)
        //vis.circleRadii = [ 300,270, 240, 210, 180, 150, 120, 90, 60, 30]
        vis.industryColors.forEach(function (d,i) {
            d['radius'] = vis.circleRadii[i]
        })
        //console.log('INDUSTRY COLORS', vis.industryColors)
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
                        y: (d.radius * Math.sin(theta * (Math.PI / 180))) + vis.height / 3
                    }
                    coordinates.push(cord)
                }
            }
        })
        //console.log('CORD', coordinates)
        let sortedIndustries = vis.industryColors.map(d => d.industry)
        //console.log('SORT', sortedIndustries)
        this.displayData.sort((a, b) => (sortedIndustries.indexOf(a.Industry) - sortedIndustries.indexOf(b.Industry) || a['Valuation ($B)'] -  b['Valuation ($B)']));
        this.displayData.forEach(function(d,index){
            d['x'] = coordinates[index].x
            d['y'] = coordinates[index].y
            d['color'] = vis.industryColors.find(c => c.industry === d.Industry).color
        })
        //console.log('displayData', vis.displayData)
        // if (selectedCountry === '') {
        //     vis.displayData = []
        // }
        // else {
        //     vis.displayData = vis.displayData
        // }
        vis.updateVis();
    }

    updateVis(){

        let vis = this;
        vis.circleRad.domain([0, d3.max(vis.displayData, d => d['Valuation ($B)'])]);
        let invertedLegCircles = [0]
        vis.legendCircleRadii.forEach(d => invertedLegCircles.push(Math.round(vis.circleRad.invert(d))))
        console.log('invertlist', invertedLegCircles)
        vis.valScale.domain(invertedLegCircles)
        vis.svg2.select(".val-axis").call(vis.valAxis);


        //console.log('scale_test', vis.circleRad(vis.displayData[0]['Valuation ($B)']))
        //let colors = ['#fd8acd','#ed1f24','#ff6700','#fed00d','#55bb47', '#066b38','#00b3ff','#0900f9', '#4b08a1', '#828085']

        let formatTime = d3.timeFormat("%m/%d/%y")

        // Black background circles
        vis.bgCircles = vis.svg.selectAll(".bgCircles")
            .data(vis.circleRadii.slice(-vis.counter));

        vis.bgCircles.exit().remove()

        vis.bgCircles.enter()
            .append("circle")
            .attr('class',"bgCircles")
            .merge(vis.bgCircles)
            .transition()
            .attr("cx", vis.width/2)
            .attr("cy", vis.height/3)
            .attr("r", d => d)
            .style("stroke", 'grey')
            .style("fill", "none" )
            .style('opacity', .4)
            .style("stroke-width", 1);

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
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .attr('stroke', 'black')
                vis.tooltip.style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid #bf80ff; border-radius: 5px; background:  #f2e6ff; padding: 20px">
                         <h2><strong>${d.Company}</strong><h2>
                         <h3>Valuation ($B): ${d['Valuation ($B)']}</h3>
                         <h3> Location: ${d.City}, ${d.Country}</h3>
                         <h3> Select Investors: ${d['Select Inverstors']}</h3>
                          <h3> Year Founded: ${d['Founded Year']}</h3>
                          <h3> Date Joined: ${formatTime(d['Date Joined'])}</h3>
                     </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr('stroke', d => d.color)
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``)
                ;
            })

    }


}