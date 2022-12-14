/* * * * * * * * * * * * * *
*        RainbowVis        *
* * * * * * * * * * * * * */

class RainbowVis {

    constructor(parentElement, data, industryColors) {
        this.parentElement = parentElement;
        this.data = data;
        this.industryColors = industryColors;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        d3.parliament=function(){
            function t(t){
                t.each(function(t){
                    e=e?e:this.getBoundingClientRect().width,n=e?e/2:this.getBoundingClientRect().width/2;
                    var c=Math.min(e/2,n),s=c*a,f=d3.select(this),m=0;
                    t.forEach(function(t){m+="number"==typeof t.seats?Math.floor(t.seats):t.seats.length});
                    var h=0,d=0,g=.5;!function(){
                        for(var t=a/(1-a);d<m;)h++,g+=t,d=r(function(t){return Math.floor(Math.PI*(g+t))},h-1)}();
                    var p=(c-s)/h,v=[];
                    !function(){for(var t=d-m,r=0;r<h;r++)for(var e=s+p*(r+.5),n=Math.floor(Math.PI*(g+r))-Math.floor(t/h)-(t%h>r?1:0),a=Math.PI/n,o=0;o<n;o++){var i={};i.polar={r:e,teta:-Math.PI+a*(o+.5)},i.cartesian={x:i.polar.r*Math.cos(i.polar.teta),y:i.polar.r*Math.sin(i.polar.teta)},v.push(i)}}(),v.sort(function(t,r){return t.polar.teta-r.polar.teta||r.polar.r-t.polar.r}),function(){var r=0,e=0;v.forEach(function(n){var a=t[r],o="number"==typeof a.seats?a.seats:a.seats.length;e>=o&&(r++,e=0,a=t[r]),n.party=a,n.data="number"==typeof a.seats?null:a.seats[e],e++})}();
                    var C=function(t){var r="seat ";return r+=t.party&&t.party.id||"",r.trim()},y=function(t){return t.cartesian.x},M=function(t){return t.cartesian.y},T=function(t){var r=.4*p;return t.data&&"number"==typeof t.data.size&&(r*=t.data.size),r},b=f.select(".parliament");
                    b.empty()&&(b=f.append("g"),b.classed("parliament",!0)),b.attr("transform","translate("+e/2+","+c+")");
                    var x=b.selectAll(".seat").data(v);x.attr("class",C);
                    var B=x.enter().append("circle");
                    if(B.attr("class",C),B.attr("cx",o.fromCenter?0:y),B.attr("cy",o.fromCenter?0:M),B.attr("r",o.smallToBig?0:T),o.fromCenter||o.smallToBig){var S=B.transition().duration(function(){return 1e3+800*Math.random()});o.fromCenter&&(S.attr("cx",y),S.attr("cy",M)),o.smallToBig&&S.attr("r",T)}for(var w in u._)!function(t){B.on(t,function(r){u.call(t,this,r)})}(w);
                    if(i.animate)var I=x.transition().duration(function(){return 1e3+800*Math.random()});
                    else var I=x;
                    if(I.attr("cx",y).attr("cy",M).attr("r",T),l.toCenter||l.bigToSmall){var S=x.exit().transition().duration(function(){return 1e3+800*Math.random()});l.toCenter&&S.attr("cx",0).attr("cy",0),l.bigToSmall&&S.attr("r",0),S.remove()}else x.exit().remove()})}function r(t,r){for(var e=0,n=0;n<=r;n++)e+=t(n);return e}var e,n,a=.4,o={smallToBig:!0,fromCenter:!0},i={animate:!0},l={bigToSmall:!0,toCenter:!0},u=d3.dispatch("click","dblclick","mousedown","mouseenter","mouseleave","mousemove","mouseout","mouseover","mouseup","touchcancel","touchend","touchmove","touchstart");return t.width=function(r){return arguments.length?(e=r,t):e},t.height=function(r){return arguments.length?t:n},t.innerRadiusCoef=function(r){return arguments.length?(a=r,t):a},t.enter={smallToBig:function(r){return arguments.length?(o.smallToBig=r,t.enter):o.smallToBig},fromCenter:function(r){return arguments.length?(o.fromCenter=r,t.enter):o.fromCenter}},t.update={animate:function(r){return arguments.length?(i.animate=r,t.update):i.animate}},t.exit={bigToSmall:function(r){return arguments.length?(l.bigToSmall=r,t.exit):l.bigToSmall},toCenter:function(r){return arguments.length?(l.toCenter=r,t.exit):l.toCenter}},t.on=function(t,r){u.on(t,r)},t};

        vis.margin = {bottom: 0, top: 0, right: 10, left: 10}

        vis.width = document.getElementById('rainbow-diagram').getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 1500 - vis.margin.top - vis.margin.bottom;

        vis.parliament = d3.parliament()
            .width(vis.width)
            .innerRadiusCoef(0.4);

        vis.parliament.enter
            .fromCenter(false)
            .smallToBig(false);

        vis.svg = d3.select('#rainbow-diagram')
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', 'translate('+ vis.margin.left+ ','+ vis.margin.top + ')')

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')

        let industries = vis.data.map(d => {
            let industryAbbrev = null;
            if (d.Industry === 'Artificial intelligence') {
                industryAbbrev = 'AI'
            } else if (d.Industry === 'Consumer retail') {
                industryAbbrev = 'CR'
            }
            else if (d.Industry === 'Cybersecurity') {
                industryAbbrev = 'CS'
            } else if (d.Industry === 'Data management & analytics, Edtech') {
                industryAbbrev = 'DMAE'
            } else if (d.Industry === 'Fintech') {
                industryAbbrev = 'Fintech'
            } else if (d.Industry === 'Health') {
                industryAbbrev = 'Health'
            } else if (d.Industry === 'Internet software & services, Hardware') {
                industryAbbrev = 'ISSH'
            } else if (d.Industry === 'Mobile & telecommunications') {
                industryAbbrev = 'MT'
            } else if (d.Industry === 'Supply chain, logistics, & delivery') {
                industryAbbrev = 'NSCLD'
            } else {
                industryAbbrev = 'Other';
            }
            return {
                ...d,
                industryAbbrev: industryAbbrev
            }
        })

        let group = Array.from(d3.group(industries, d => d.industryAbbrev), ([id, seats]) => ({id, seats})).sort((a,b) => d3.ascending(a.id,b.id))

        vis.svg.datum(group)
            .call(vis.parliament);

        vis.color = d3.scaleOrdinal()
            .domain(vis.industryColors)
            .range(vis.industryColors);
    }
}