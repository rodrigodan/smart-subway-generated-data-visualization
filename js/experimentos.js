// objetos:
// dataset: datas
// xName:
// yObjs: 'Entrada': {column: 'Entrada'}, 'AG': {column: 'AG'}, 'Captura': {column: 'Captura'}
// axisLables: {xAxis: 'Capturas', yAxis: 'Gerações'}

function makeLineChart(dataset, xName, yObjs, axisLables) {
    var chartObj = {};
    console.log(dataset)
    // orginal scale
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    chartObj.xAxisLable = axisLables.xAxis;
    chartObj.yAxisLable = axisLables.yAxis;
    /*
     yObjsects format:
     {y1:{column:'',name:'name',color:'color'},y2}
     */

    chartObj.data = dataset;
    chartObj.margin = {top: 15, right: 60, bottom: 30, left: 50};
    chartObj.width = 650 - chartObj.margin.left - chartObj.margin.right;
    chartObj.height = 480 - chartObj.margin.top - chartObj.margin.bottom;


    var count = [];
    var temp = 0;

    while(temp*40 <= 340){
        count[temp] = temp*40;
        temp++;
    }

// So we can pass the x and y as strings when creating the function

    chartObj.xFunct = function(d){return d[xName]};

// For each yObjs argument, create a yFunction
    function getYFn(column) {
        return function (d) {
            return d[column];
        };
    }

// Object instead of array
    chartObj.yFuncts = [];
    for (var y  in yObjs) {

        yObjs[y].name = y;
        yObjs[y].yFunct = getYFn(yObjs[y].column); //Need this  list for the ymax function
        chartObj.yFuncts.push(yObjs[y].yFunct);
    }

//Formatter functions for the axes
    chartObj.formatAsNumber = d3.format(".0f");
    chartObj.formatAsDecimal = d3.format(".2f");
    chartObj.formatAsCurrency = d3.format("$.2f");
    chartObj.formatAsFloat = function (d) {
        if (d % 1 !== 0) {
            return d3.format(".2f")(d);
        } else {
            return d3.format(".0f")(d);
        }
        
    };

    chartObj.xFormatter = chartObj.formatAsNumber;
    chartObj.yFormatter = chartObj.formatAsFloat;

    chartObj.bisectYear = d3.bisector(chartObj.xFunct).left; //< Can be overridden in definition

//Create scale functions
    chartObj.xScale = d3.scaleLinear().range([0, chartObj.width]).domain([0,343]);
    chartObj.yScale = d3.scaleLinear().range([chartObj.height, 0]).domain([0, 130]);


// Get the max of every yFunct
    chartObj.max = function (fn) {
        return d3.max(chartObj.data, fn);
    };
    console.log("foi:")
    console.log(d3.max(chartObj.yFuncts.map(chartObj.max)));

    chartObj.formatAsYear = d3.format("");

//Create axis
    chartObj.xAxis = d3.axisBottom(chartObj.xScale).tickValues(count); //< Can be overridden in definition
    chartObj.yAxis = d3.axisLeft(chartObj.yScale).tickFormat(chartObj.yFormatter).tickValues([0,50,100,130]); //< Can be overridden in definition


// Build line building functions
    function getYScaleFn(yObj) {
        return function (d) {
            return chartObj.yScale(yObjs[yObj].yFunct(d));
        };
    }
    for (var yObj in yObjs) {
        yObjs[yObj].line = d3.line().curve(d3.curveCardinal).x(function (d) {
            return chartObj.xScale(chartObj.xFunct(d));
        }).y(getYScaleFn(yObj));
    }
    

    chartObj.svg;

    
  
// Change chart size according to window size
    chartObj.update_svg_size = function () {

        chartObj.width = parseInt(chartObj.chartDiv.style("width"), 10) - (chartObj.margin.left + chartObj.margin.right);

        chartObj.height = parseInt(chartObj.chartDiv.style("height"), 10) - (chartObj.margin.top + chartObj.margin.bottom);

        /* Update the range of the scale with new width/height */
        chartObj.xScale.range([0, chartObj.width]);
        chartObj.yScale.range([chartObj.height, 0]);

        if (!chartObj.svg) {return false;}

        /* Else Update the axis with the new scale */
        chartObj.svg.select('.x.axis').attr("transform", "translate(0," + chartObj.height + ")").call(chartObj.xAxis);
        chartObj.svg.select('.x.axis .label').attr("x", chartObj.width / 2);

        chartObj.svg.select('.y.axis').call(chartObj.yAxis);
        chartObj.svg.select('.y.axis .label').attr("x", -chartObj.height / 2);

        /* Force D3 to recalculate and update the line */
        for (var y  in yObjs) {
            yObjs[y].path.attr("d", yObjs[y].line);
        }
        

        d3.selectAll(".focus.line").attr("y2", chartObj.height);

        chartObj.chartDiv.select('svg').attr("width", chartObj.width + (chartObj.margin.left + chartObj.margin.right)).attr("height", chartObj.height + (chartObj.margin.top + chartObj.margin.bottom));

        chartObj.svg.select(".overlay").attr("width", chartObj.width).attr("height", chartObj.height);
        return chartObj;
    };

    chartObj.bind = function (selector) {
        chartObj.mainDiv = d3.select(selector);
        // Add all the divs to make it centered and responsive
        chartObj.mainDiv.append("div").attr("class", "inner-wrapper").append("div").attr("class", "outer-box").append("div").attr("class", "inner-box");
        chartSelector = selector + " .inner-box";
        chartObj.chartDiv = d3.select(chartSelector);
        d3.select(window).on('resize.' + chartSelector, chartObj.update_svg_size);
        chartObj.update_svg_size();
        return chartObj;
    };

// Render the chart
    chartObj.render = function () {
        //Create SVG element
        chartObj.svg = chartObj.chartDiv.append("svg").attr("class", "chart-area").attr("width", chartObj.width + (chartObj.margin.left + chartObj.margin.right)).attr("height", chartObj.height + (chartObj.margin.top + chartObj.margin.bottom)).append("g").attr("transform", "translate(" + chartObj.margin.left + "," + chartObj.margin.top + ")");

        


        // Draw Lines
        for (var y  in yObjs) {

            yObjs[y].path = chartObj.svg.append("path").datum(chartObj.data).attr("class", "line").attr("d", yObjs[y].line).style("stroke", color(y)).attr("data-series", y).style("stroke-width", "1px").on("mouseover", function () {
                focus.style("display", null);
            }).on("mouseout", function () {
                focus.transition().delay(700).style("display", "none");
            }).on("mousemove", mousemove);  
        }
        

        // Draw Axis
        chartObj.svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + chartObj.height + ")").call(chartObj.xAxis).append("text").attr("class", "label").attr("x", chartObj.width / 2).attr("y", 30).style("text-anchor", "middle").text(chartObj.xAxisLable);

        chartObj.svg.append("g").attr("class", "y axis").call(chartObj.yAxis).append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("y", -42).attr("x", -chartObj.height / 2).attr("dy", ".71em").style("text-anchor", "middle").text(chartObj.yAxisLable);

        //Draw tooltips
        var focus = chartObj.svg.append("g").attr("class", "focus").style("display", "none");
       
        for (var y  in yObjs) {
       
            yObjs[y].tooltip = focus.append("g");
            yObjs[y].tooltip.append("circle").attr("r", 5);
            yObjs[y].tooltip.append("rect").attr("x", 8).attr("y","-5").attr("width",34).attr("height",'1.5em').attr("stroke","#4ec5f6").attr("stroke-width", "2");
            yObjs[y].tooltip.append("text").attr("x", 9).attr("dy", ".35em");
        }

        // Year label
        focus.append("text").attr("class", "focus year").attr("x", 9).attr("y", 7);
        // Focus line
        focus.append("line").attr("class", "focus line").attr("y1", 0).attr("y2", chartObj.height);

        //Draw legend
        var legend = chartObj.mainDiv.append('div').attr("class", "legend");
        for (var y  in yObjs) {
            series = legend.append('div');
            series.append('div').attr("class", "series-marker").style("background-color", color(y));
            series.append('p').text(y);
            yObjs[y].legend = series;
        }

        // Overlay to capture hover
        chartObj.svg.append("rect").attr("class", "overlay").attr("width", chartObj.width).attr("height", chartObj.height).on("mouseover", function () {
            focus.style("display", null);
        }).on("mouseout", function () {
            focus.style("display", "none");
        }).on("mousemove", mousemove);


        valXLabel = -25;
        valYLabel = -80;
        // valYLabel = -200;

        chartObj.svg.append("text")
        .attr("class", "x axisLabel")
        .attr("font-size", "30px")
        .attr("fill", "#373C42")
        .attr("text-anchor", "middle")
        .text("Capturas")
        .attr("y", parseInt(chartObj.height) + 25)
        .attr("x",parseInt(chartObj.height));

        
        chartObj.svg.append("text")
        .attr("class", "y axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", valXLabel)
        .attr("x", valYLabel)
        .attr("font-size", "30px")
        .attr("fill", "#373C42")
        .attr("text-anchor", "middle")
        .text("Velocidade (km)")


        return chartObj;


        function mousemove() {
            var x0 = chartObj.xScale.invert(d3.mouse(this)[0]), i = chartObj.bisectYear(dataset, x0, 1), d0 = chartObj.data[i - 1], d1 = chartObj.data[i];
            try {
                var d = x0 - chartObj.xFunct(d0) > chartObj.xFunct(d1) - x0 ? d1 : d0;
            } catch (e) { return;}
            minY = chartObj.height;

            var cont = 0;

            for (var y  in yObjs) {
                yObjs[y].tooltip.attr("transform", "translate(" + chartObj.xScale(chartObj.xFunct(d)) + "," + chartObj.yScale(yObjs[y].yFunct(d)) + ")");
                yObjs[y].tooltip.select("text").text(chartObj.yFormatter(yObjs[y].yFunct(d)));

                yObjs[y].tooltip.select("text").style("font-weight", "bold");

                if(cont% 2 === 0 ){
                    yObjs[y].tooltip.select("text").attr("transform","translate(10,-8)");
                    yObjs[y].tooltip.select("rect").style("fill","white").attr("transform","translate(10,-10)");
                }
                else{
                    yObjs[y].tooltip.select("text").attr("transform","translate(10, 12)");
                    yObjs[y].tooltip.select("rect").style("fill","white").attr("transform","translate(10, 10)");
                }
                cont += 1;

                minY = Math.min(minY, chartObj.yScale(yObjs[y].yFunct(d)));
            }

            focus.select(".focus.line").attr("transform", "translate(" + chartObj.xScale(chartObj.xFunct(d)) + ")").attr("y1", minY);
            // ONDE FICA O LABEL DO YEAR:
            // focus.select(".focus.year").text("Year: " + chartObj.xFormatter(chartObj.xFunct(d)));
        }

    };

    return chartObj;
}