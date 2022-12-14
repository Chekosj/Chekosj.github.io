/* * * * * * * * * * * * * *
*         HistoVis         *
* * * * * * * * * * * * * */

class HistoVis {

    constructor(parentElement, data,industryColors) {
        this.parentElement = parentElement;
        this.data =data
        this.industryColors = industryColors
        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {bottom: document.getElementById('area-chart').getBoundingClientRect().width/2, top: 10, right: 10, left: 10}

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .padding(.2)

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])

        vis.xAxisGroup = vis.svg.append('g')
            .attr("class", "x-axis axis")
            .attr('transform', 'translate(0,' + vis.height+")");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis")

        // Axis titles
        vis.svg.append("text")
            .attr('text-anchor','start')
            .attr("x", -25)
            .attr("y", -20)
            .attr("fill", "white")
            .text("Number of Companies");
        vis.svg.append("text")
            .attr('text-anchor','middle')
            .attr("x", vis.width/2)
            .attr("y", vis.height + 50)
            .attr("fill", "white")
            .text("Years From Founding Until Company Became a Unicorn");

        this.wrangleData();
    }

    wrangleData(){
        let vis = this
        // Pulling this straight from dataTable.js
        vis.bins = Array.from(d3.rollup(vis.data, d => d.length, d => d['Years From Founding to Joined']), ([years,count]) => ({years,count}))
        let yearRange = Array.from((Array(d3.max(vis.bins, d => d.years)).keys()))
        yearRange.forEach(function(d) {
            if (vis.bins.filter(e => e.years == d).length <= 0) {
                /* vendors contains the element we're looking for */
                let temp = {years: d, count: 0};
                vis.bins.push(temp)
            }
        })
        vis.bins.sort((a,b) => d3.ascending(a.years, b.years))

        vis.updateVis()
    }

    wrangleData2(){
        let vis = this
        // Pulling this straight from dataTable.js
        vis.bins = Array.from(d3.rollup(vis.data.filter(e => e.Industry === selectedIndustry), d => d.length, d => d['Years From Founding to Joined']), ([years,count]) => ({years,count}))
        let yearRange = Array.from((Array(d3.max(vis.bins, d => d.years)).keys()))
        yearRange.forEach(function(d) {
            if (vis.bins.filter(e => e.years == d).length <= 0) {
                /* vendors contains the element we're looking for */
                let temp = {years: d, count: 0};
                vis.bins.push(temp)
            }
        })
        vis.bins.sort((a,b) => d3.ascending(a.years, b.years))

        vis.updateVis()
    }

    updateVis(transitionTime = 500){
        let vis = this;

        //Update axes
        vis.x.domain(Array.from(Array(d3.max(vis.bins,d => d.years)+3).keys()))
        vis.y.domain([0, 140])

        vis.y.domain([0, d3.max(vis.bins, d => d.count)])

        let myArray = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

        for (let i = myArray.length; i >= 0; i--){
            if (myArray[i] > (2+d3.max(Array.from(Array(d3.max(vis.bins,d => d.years)+1).keys())))) {
                myArray.splice(i, 1)
            }
        }

        vis.xAxis = d3.axisBottom()
            .tickSizeOuter(0)
            .scale(vis.x)
            .tickValues(myArray)

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.select(".x-axis")
            .transition()
            .duration(transitionTime)
            .call(vis.xAxis);

        vis.svg.select(".y-axis")
            .transition()
            .duration(transitionTime)
            .call(vis.yAxis);

        // Append bars
        vis.bars = vis.svg.selectAll('rect')
            .data(vis.bins, d => d.year);

        vis.bars.exit().remove();

        // update bars and create hover and tooltip effects
        vis.bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .merge(vis.bars)
            .attr("x", d => vis.x(d.years))
            .attr("y", d => vis.y(d.count))
            .attr("width", vis.x.bandwidth())
            .transition()
            .duration(transitionTime)
            .attr("height",  function (d) { let barHeight = vis.height - vis.y(d.count); return (barHeight < 0) ? 0 : barHeight;} )
            .attr('fill', function (d) {
                if (selectedIndustry === '') {
                    return 'white'
                }
                else {
                    return vis.industryColors.find(c => c.industry === selectedIndustry).color
                }
            })
    }
}