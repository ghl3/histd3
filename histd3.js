//
// The class
//

// Declare the 'hist' class
function hist(num_bins, var_min, var_max) {

    this.bins = num_bins;
    this.min = var_min;
    this.max = var_max;

    //this.data_values = null;
    this.hist_bins = null;


    // Calculate the boundaries
    this.margin = {top: 10, right: 30, bottom: 30, left: 30},
    this.width = 960 - this.margin.left - this.margin.right,
    this.height = 500 - this.margin.top - this.margin.bottom;

    // Create the x-axis mapping function
    this.x = d3.scale.linear()
	.domain([this.min, this.max])
	.range([0, this.width]);

    // Create the y-axis mapping function
    this.y = d3.scale.linear();

}

// Simple function to set the data
hist.prototype.fill = function(values) { 
    //this.data_values = values; 

    // Generate a histogram using twenty uniformly-spaced bins.
    this.hist_bins = d3.layout.histogram().bins(this.x.ticks(this.bins))(values);

    this.y.domain([0, d3.max(this.hist_bins, function(d) { return d.y; })])
	.range([this.height, 0]);

    return this;
}

// Function to draw the histogram in the
// dom object described by the selector
hist.prototype.draw = function(selector) {
    
    console.log("drawing histogram");

    var formatCount = d3.format(",.0f");

    // Create the x axis
    var xAxis = d3.svg.axis()
	.scale(this.x)
	.orient("bottom");

    var svg = d3.select(selector).append("svg")
	.attr("width", this.width + this.margin.left + this.margin.right)
	.attr("height", this.height + this.margin.top + this.margin.bottom)
	.append("g")
	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    var x_scale = this.x;
    var y_scale = this.y;
    var this_hist_bins = this.hist_bins;

    var bar = svg.selectAll(".bar")
	.data(this_hist_bins)
	.enter().append("g")
	.attr("class", "bar")    
	.attr("transform", function(d) { 
	    //return "translate(" + this.x(d.x) + "," + this.y(d.y) + ")"; 
	    return "translate(" + x_scale(d.x) + "," + y_scale(d.y) + ")"; 
	});
    
    var this_height = this.height;
    
    bar.append("rect")
	.attr("x", 1)
	.attr("width", this.x(this.hist_bins[0].dx) - 1)
	.attr("height", function(d) { return this_height - y_scale(d.y); });

    bar.append("text")
	.attr("dy", ".75em")
	.attr("y", 6)
	.attr("x", this.x(this.hist_bins[0].dx) / 2)
	.attr("text-anchor", "middle")
	.text(function(d) { return formatCount(d.y); });

    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + this.height + ")")
	.call(xAxis);

    return this;
}
