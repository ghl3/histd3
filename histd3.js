
// Generate an Irwin–Hall distribution of 10 random variables.
/*


// A formatter for counts.
var canvas_name = "#the_canvas";
var num_bins = 20;

var var_min = 0.0;
var var_max = 2.0;
*/

//
// The class
//

function hist(num_bins, var_min, var_max) {

    this.bins = num_bins;
    this.min = var_min;
    this.max = var_max;

    this.data_values = null;
}

hist.prototype.data = function(values) { 

    this.data_values = values; 
    return this;

}

hist.prototype.draw = function(div_select) {
    
    console.log("drawing histogram");

    //draw(this.data_values, this.bins, this.min, this.max, div_select);

    var formatCount = d3.format(",.0f");

    var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    //function draw(values, num_bins, var_min, var_max, div_select) {
    
    // Create the x-axis mapping function
    var x = d3.scale.linear()
	.domain([this.min, this.max])
	.range([0, width]);

    // Generate a histogram using twenty uniformly-spaced bins.
    var hist_bins = d3.layout.histogram().bins(x.ticks(this.bins))(this.data_values);

    // Create the y-axis mapping function
    var y = d3.scale.linear()
	.domain([0, d3.max(hist_bins, function(d) { return d.y; })])
	.range([height, 0]);

    // Create the x axis
    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

    var svg = d3.select(div_select).append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
	.data(hist_bins)
	.enter().append("g")
	.attr("class", "bar")
	.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    bar.append("rect")
	.attr("x", 1)
	.attr("width", x(hist_bins[0].dx) - 1)
	.attr("height", function(d) { return height - y(d.y); });

    bar.append("text")
	.attr("dy", ".75em")
	.attr("y", 6)
	.attr("x", x(hist_bins[0].dx) / 2)
	.attr("text-anchor", "middle")
	.text(function(d) { return formatCount(d.y); });

    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

    return this;
}

/*
// Make the hist
//hist(values, num_bins, var_min, var_max, canvas_name);

var my_hist = new hist(num_bins, var_min, var_max);
console.log( my_hist );

//console.log( my_hist.data(values) );

my_hist.data(values).draw(canvas_name);
*/
