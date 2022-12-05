/* * * * * * * * * * * * * *
*         AreaChart        *
* * * * * * * * * * * * * */

class AreaChart {

    constructor(parentElement, data, industryColors) {
        this.parentElement = parentElement;
        this.data = data;
        this.industryColors = industryColors
        this.displayData = [];
        this.selectedIndustry = '';
        this.filter = "";

        this.focus = false;
        this.selectedIndex = 0

        this.initVis();
    }

    //Initialize visualization (static content; e.g. SVG area, axes, brush component)
    initVis() {
        let vis = this;

        // Reformat data
        let years = [...Array(d3.max(vis.data, d => d['Year Joined']) - d3.min(vis.data, d => d['Year Joined'])).keys()].map(i => i + d3.min(vis.data, d => d['Year Joined']));
        vis.data2 = []
        years.forEach(function(d,index) {
            let yearData = vis.data.filter(y => y['Year Joined'] === d)
            let object = {year: d}
            let indCnt = Array.from(d3.rollup(yearData, y => y.length, y => y['Industry']), ([industry,count]) => ({industry,count}))
            vis.industryColors.forEach(function (c) {
                let status = indCnt.find(e => e.industry === c.industry)
                let count = 0
                if (typeof status !== 'undefined') {
                    count = indCnt.find(e => e.industry === c.industry).count
                }
                object[c.industry] = count
            })
            vis.data2.push(object)
        })

        vis.margin = {bottom: document.getElementById('area-chart').getBoundingClientRect().width/2, top: 10, right: 10, left: 10}

        vis.width = document.getElementById('area-chart').getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById('area-chart').getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select('#' + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width])
            .domain([d3.min(vis.data, function (d) {return d['Year Joined']}), d3.max(vis.data, function (d) {return d['Year Joined']})]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickFormat(x => x);

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.industries = vis.industryColors.map(d => d.industry)

        let stack = d3.stack()
            .keys(vis.industries);

        vis.stackedData = stack(vis.data2);

        vis.area = d3.area()
            .curve(d3.curveCardinal)
            .x(d=> vis.x(d.data.year))
            .y0(d=> vis.y(d[0]))
            .y1(d=> vis.y(d[1]));

        vis.areaSingle = d3.area()
            .curve(d3.curveCardinal)
            .x(d => vis.x(d.data.year))
            .y0(vis.height)
            .y1(d => vis.y(d[1]-d[0]));

        vis.placeholder = vis.svg.append("text")
            .attr("class", "categories")
            .style("opacity", 0.8)
            .attr("x", vis.width/2)
            .attr("y", vis.height/5)
            .style("fill", "white")
            .attr('text-anchor','middle')
            .text("Please click a colored layer below.")

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
            .text("Year Company Became a Unicorn");

        let colors = vis.industryColors.map(d => d.color)
        this.colorScale = d3.scaleOrdinal()
            .domain(vis.industries)
            .range(colors);

        vis.wrangleData();
    }


    // Data wrangling

    wrangleData(transitionTime = 0) {
        let vis = this;

        vis.displayData = vis.stackedData;

        if (vis.filter !== "") {
            let index = vis.industries.findIndex(d => d === vis.filter);
            vis.displayData = [vis.stackedData[index]];
        }

        // Update the visualization
        vis.updateVis(transitionTime);
    }

    // The drawing function

    updateVis(transitionTime = 0) {
        let vis = this;

        vis.y.domain([0, d3.max(vis.displayData, function (d) {
            return d3.max(d, function (e) {
                if (vis.focus) {
                    return e[1] - e[0];
                } else {
                    return e[1];
                }
            });
        })
        ]);

        // Draw the layers
        let categories = vis.svg.selectAll(".area")
            .data(vis.displayData);

        categories.enter().append("path")
            .attr("class", "area")
            .merge(categories)
            .on("mouseover", (event, d) => {
                vis.placeholder.text(d.key)
                d3.selectAll(".area")
                    .style("cursor", "pointer")
                    .style("font-size", 20)
            })
            .on("mouseout", (event, d) => {
                vis.placeholder
                    .attr("x", vis.width/2)
                    .attr("y", vis.height/5)
                    .attr("fill", "white")
                    .attr("opacity", 1)
                    .text("Please click a colored layer below.")
            })
            .on("click", (event, d) => {
                let t = (vis.filter) ? 0 : 400;
                vis.filter = (vis.filter) ? "" : vis.industries[d.index];
                vis.focus ? vis.focus = false : vis.focus = true
                vis.selectedIndustry = d.key;
                selectedIndustry = vis.selectedIndustry
                if (vis.filter) {
                    histoVis.wrangleData2()
                }
                else {
                    selectedIndustry = ''
                    histoVis.wrangleData()
                }
                vis.updateArea();
                vis.wrangleData(t);
            })
            .style("fill", d => vis.colorScale(d))
            .transition(d3.transition().duration(transitionTime))
            .attr("d", d => {
                if(vis.filter) {return vis.areaSingle(d);} else {return vis.area(d);}
            })
        categories.exit().remove();

        // Update axes
        vis.svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(vis.yAxis);
        vis.svg.select(".x-axis")
            .transition()
            .duration(500)
            .call(vis.xAxis);
    }

    updateArea() {
        svg.selectAll('areas').style('opacity', function (d) {
            if(d.Industry === vis.selectedIndustry) {
                return 1;
            }
            else {
                return 0;
            }
        })
    }
}