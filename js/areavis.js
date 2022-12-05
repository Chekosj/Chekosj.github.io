/*
 * AreaChart - Object constructor function
 * @param _parentElement   -- the HTML element in which to draw the area chart
 * @param _data                   -- the dataset 'household characteristics'
 */


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

    /*
     * Initialize visualization (static content; e.g. SVG area, axes, brush component)
     */

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
            //console.log('object', object)
        })

        // console.log('data2', vis.data2)
        //let years = vis.data.map(d => d.)
        //vis.bins = Array.from(d3.rollup(vis.data, d => d.length, d => d['Years From Founding to Joined']), ([years,count]) => ({years,count}))

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

        // TO-DO (Activity II): Initialize stack layout
        let stack = d3.stack()
            .keys(vis.industries);

        // TO-DO (Activity II) Stack data
        vis.stackedData = stack(vis.data2);
        //this.stackedData = stackedData
        console.log('hi',vis.stackedData)


        // TO-DO (Activity II) Stacked area layout
        vis.area = d3.area()
            .curve(d3.curveCardinal)
            .x(d=> vis.x(d.data.year)) // Not sure if this is right
            .y0(d=> vis.y(d[0]))
            .y1(d=> vis.y(d[1]));

        // Optional Activity:
        vis.areaSingle = d3.area()
            .curve(d3.curveCardinal)
            .x(d => vis.x(d.data.year))
            .y0(vis.height)
            .y1(d => vis.y(d[1]-d[0]));

        //TO-DO (Activity IV): Add Tooltip placeholder
        vis.placeholder = vis.svg.append("text")
            .attr("class", "categories")
            .style("opacity", 0.8)
            .attr("x", 20)
            .attr("y", 20)

        // Axis titles
        vis.svg.append("text")
            .attr("x", -50)
            .attr("y", -8)
            .text("Number of Companies");
        vis.svg.append("text")
            .attr('text-anchor','end')
            .attr("x", vis.width)
            .attr("y", vis.height + 35)
            .text("Year That Company Became a Unicorn");

        // vis.color = d3.scaleOrdinal()
        //     .domain(vis.industryColors)
        //     .range(vis.industryColors);
        let colors = vis.industryColors.map(d => d.color)
        this.colorScale = d3.scaleOrdinal()
            .domain(vis.industries)
            .range(colors);

        //console.log("color", vis.color)

        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData(transitionTime = 0) {
        let vis = this;

        //vis.displayData = vis.stackedData;
        // vis.industryColors.forEach(function (c) {
        //     let dataFiltered = vis.data.filter(d => d.Industry === c.industry)
        //     let grouped = d3.rollup(dataFiltered, dataFiltered => dataFiltered.length, d => d['Year Joined']);
        //     let yearJoined = Array.from(grouped, ([yearJoined, num]) => ({yearJoined, num}));
        //     yearJoined.sort((a,b) => d3.ascending(a.yearJoined, b.yearJoined));
        //     c.yearJoined = yearJoined
        // })
        // //console.log(vis.industryColors)
        //
        // vis.displayData = vis.industryColors
        // vis.displayData.sort((a,b) => d3.ascending(a.id, b.id));
        // vis.displayData.filter(d => d.Industry === vis.selectedIndustry)

        // if vis.focus is an empty string
        vis.displayData = vis.stackedData;

        if (vis.filter !== "") {
            let index = vis.industries.findIndex(d => d === vis.filter);
            vis.displayData = [vis.stackedData[index]];
        }

        // Update the visualization
        vis.updateVis(transitionTime);
    }

    /*
     * The drawing function
     */

    updateVis(transitionTime = 0) {
        let vis = this;

        //console.log(vis.displayData)

        //console.log('max', d3.max(vis.displayData[0].yearJoined, d => d.num))

        //vis.x.domain([d3.min(vis.data, function (d) {return d['Year Joined']}), d3.max(vis.data, function (d) {return d['Year Joined']})]);

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

            // TO-DO (Activity IV): update tooltip text on hover
            .on("mouseover", (event, d) => vis.placeholder.text(d.key))
            .on("mouseout", (event, d) => vis.placeholder.text(""))
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
                console.log('d note: ' + d.key)
                vis.wrangleData(t);
            })
            .style("fill", d => vis.colorScale(d))
            .transition(d3.transition().duration(transitionTime))
            .attr("d", d => {
                if(vis.filter) {return vis.areaSingle(d);} else {return vis.area(d);}
            })

        categories.exit().remove();

        //
        //  // D3 area path generator
        // //vis.area = d3.area()
        // //    .curve(d3.curveCardinal)
        // //    .x(d => vis.x(d.yearJoined.yearJoined))
        // //    .y0(vis.height)
        // //    .y1(d => vis.y(d.yearJoined.num));
        //  for (let i = 0; i < vis.displayData.length; i++) {
        //      let temp = vis.displayData[i].yearJoined
        //      vis.svg.append("path")
        //          .datum(temp)
        //          .attr('class', 'areas')
        //          .attr("fill", vis.displayData[i].color)
        //          .attr('opacity', 0.7)
        //          .attr("d", d3.area()
        //              .x(function (d) {
        //                  return vis.x(d.yearJoined)
        //              })
        //              .y0(vis.y(0))
        //              .y1(function (d) {
        //                  return vis.y(d.num)
        //              })
        //          )
        //  }


        // Call the area function and update the path
        // D3 uses each data point and passes it to the area function. The area function translates the data into positions on the path in the SVG.
        //vis.timePath
        //    .datum(vis.displayData[0])
        //    .attr("d", vis.area);


        // Update axes
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