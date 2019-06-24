function init(){

    // pre-definition of a margin, width and height:

    var margin = { left:80, right:100, top:50, bottom:100 },
        // height = 500 - margin.top - margin.bottom,
        // width = 800 - margin.left - margin.right;
        height = 540 - margin.top - margin.bottom,
        width = 829 - margin.left - margin.right;

    // selecting an area on chart
    var svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    // defining a group appended to svg

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left +
                ", " + margin.top + ")");

    // defining a transition

    var t = function(){ return d3.transition().duration(1000); }

    // data after be filtered:

    var dataTimeFiltered;

    var bisectDate = d3.bisector(function(d) { return d.Geracao; }).left;

    // Add the line for the first time
    g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", "3px");


    // Labels
    var xLabel = g.append("text")
        .attr("class", "x axisLabel")
        .attr("font-size", "16px")
        .attr("fill", "#373C42")
        .attr("text-anchor", "middle")
        .text("Geração");

    var yLabel = g.append("text")
        .attr("class", "y axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", -65)
        .attr("x", -170)
        .attr("font-size", "16px")
        .attr("fill", "#373C42")
        .attr("text-anchor", "middle")
        .text("Avaliação")

     // X-axis
    var xAxisCall = d3.axisBottom()
        .ticks(15)

    var xAxis = g.append("g")
        .attr("class", "x axis")
        // .attr("transform", "translate(0," + height +")");

    // Y-axis
    var yAxisCall = d3.axisLeft()
        .ticks(6)
        .tickFormat(function(d) { return (d * 100000000).toFixed(3) + "E+8"; });

    var yAxis = g.append("g")
        .attr("class", "y axis");

    // defining the values of width and height
    width = parseInt(d3.select("#chart-area").style("width"),10) - margin.left - margin.right;
    height = parseInt(d3.select("#chart-area").style("height"),10) - margin.top - margin.bottom;

    // render the content on screen
    render();


    // indetifying the window changes
  
    d3.select(window).on('resize.' , function(){
       
        // re-defining the values of width and height for window changes
        width = parseInt(d3.select("#chart-area").style("width"),10) - margin.left - (margin.right);
        height = parseInt(d3.select("#chart-area").style("height"),10) - margin.top - margin.bottom;
        
        // call the render function again
        render();

    });


    function render(){

        // define y and x position for the xLabel: "Geração":
        xLabel.attr("y", height + 50)
        .attr("x", width / 2)

        // Scales
        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        // svg stributes:
        svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // g.attr("transform", "translate(" + margin.left +
        // ", " + margin.top + ")");

        // xAxis axis being transformed:
        xAxis.attr("transform", "translate(0," + height +")");

        // Event listeners
        // run the function update, every time that the selection value is changed in html:
        // $("#coin-select").on("change", update);
        $("#coin-select").change(update);

        d3.json("data/geracao.json").then(function(data){

            dataTimeFiltered = data;

            // console.log(data);

            // Prepare and clean data
            var gera = 0;
            while (gera < 50) {

                dataTimeFiltered[gera].Geracao = +dataTimeFiltered[gera].Geracao;
                dataTimeFiltered[gera].Exp1 = parseFloat(dataTimeFiltered[gera].Exp1);
                dataTimeFiltered[gera].Exp2 = parseFloat(dataTimeFiltered[gera].Exp2);
                dataTimeFiltered[gera].Exp3 = parseFloat(dataTimeFiltered[gera].Exp3);
                dataTimeFiltered[gera].Exp4 = parseFloat(dataTimeFiltered[gera].Exp4);
                dataTimeFiltered[gera].Exp5 = parseFloat(dataTimeFiltered[gera].Exp5);
                dataTimeFiltered[gera].Exp6 = parseFloat(dataTimeFiltered[gera].Exp6);
                dataTimeFiltered[gera].Exp7 = parseFloat(dataTimeFiltered[gera].Exp7);
                dataTimeFiltered[gera].Exp8 = parseFloat(dataTimeFiltered[gera].Exp8);
                gera = gera + 1;

            }

            console.log(dataTimeFiltered);

            // Run the visualization for the first time
            update();

        })

        function update() {

            // Filter data based on selections
            var coin = $("#coin-select").val();
            // alert(coin)
            // Update scales
            x.domain(d3.extent(dataTimeFiltered, function(d){ return d.Geracao; }));
            y.domain([d3.min(dataTimeFiltered, function(d){ return d[coin]; }) / 1.005,
                d3.max(dataTimeFiltered, function(d){ return d[coin]; }) * 1.005]);

            // Update axes
            xAxisCall.scale(x);
            xAxis.transition(t()).call(xAxisCall);
            yAxisCall.scale(y);
            yAxis.transition(t()).call(yAxisCall);

            // Clear old tooltips
            d3.select(".focus").remove();
            d3.select(".overlay").remove();

            // Tooltip code
            var focus = g.append("g")
                .attr("class", "focus")
                .style("display", "none");
            focus.append("line")
                .attr("class", "x-hover-line hover-line")
                .attr("y1", 0)
                .attr("y2", height);
            focus.append("line")
                .attr("class", "y-hover-line hover-line")
                .attr("x1", 0)
                .attr("x2", width);
            focus.append("circle")
                .attr("r", 5);
            focus.append("text")
                .attr("x", 15)
                .attr("dy", ".31em");
            svg.append("rect")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .on("mouseover", function() { focus.style("display", null); })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", mousemove);

            function mousemove() {
                var x0 = x.invert(d3.mouse(this)[0]),
                    i = bisectDate(dataTimeFiltered, x0, 1),
                    d0 = dataTimeFiltered[i - 1],
                    d1 = dataTimeFiltered[i],
                    d = (d1 && d0) ? (x0 - d0.Geracao > d1.Geracao - x0 ? d1 : d0) : 0;
                    console.log("goooo :", d0);
                focus.attr("transform", "translate(" + x(d.Geracao) + "," + y(d[coin]) + ")");
                // focus.select("text").text(function() {return d[coin] });
                focus.select("text").text(function() {return (d[coin] * 100000000).toFixed(3) + "E+8"; });
                focus.select(".x-hover-line").attr("y2", height - y(d[coin]));
                focus.select(".y-hover-line").attr("x2", -x(d.Geracao));
            }

            // Path generator
            line = d3.line()
                .x(function(d){ return x(d.Geracao); })
                .y(function(d){ return y(d[coin]); });

            // Update our line path
            g.select(".line")
                .transition(t)
                .attr("d", line(dataTimeFiltered));

            
        }
    }
}



