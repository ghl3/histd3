//
// The class
//

// Declare the 'hist' class
function hist(num_bins, var_min, var_max) {

    this.bins = num_bins;
    this.min = var_min;
    this.max = var_max;

    this.hist_bins = null;

    // Calculate the boundaries
    this.margin = {top: 10, right: 30, bottom: 30, left: 30},
    this.width = 960 - this.margin.left - this.margin.right,
    this.height = 500 - this.margin.top - this.margin.bottom;

    // Create the x and y scales
    // Create the x-axis mapping function
    this.x = d3.scale.linear()
	.domain([this.min, this.max])
	.range([0, this.width]);

    // Create the y-axis mapping function
    this.y = d3.scale.linear();
    
}

hist.prototype._update_scale = function() {

    // Create the x-axis mapping function
    this.x = d3.scale.linear()
	.domain([this.min, this.max])
	.range([0, this.width]);

    // Create the y-axis mapping function
    this.y = d3.scale.linear()
	.domain([0, d3.max(this.hist_bins, function(d) { return d.y; })])
	.range([this.height, 0]);
    
}

// Simple function to set the data
hist.prototype.fill = function(values) { 

    // Generate a histogram using twenty uniformly-spaced bins.
    this.hist_bins = d3.layout.histogram().bins(this.x.ticks(this.bins))(values);

    //this._update_scale();

    /*
    this.y.domain([0, d3.max(this.hist_bins, function(d) { return d.y; })])
	.range([this.height, 0]);
    */

    return this;
}

// Function to draw the histogram in the
// dom object described by the selector
hist.prototype.draw = function(selector) {


    if( this.hist_bins == null ) {
	console.log("Cannot Draw histogram, it does not appear to be filled");
	return;
    }
    
    // javascript kinda sucks... sorry...
    var self = this;

    // Update the scale for drawing
    this._update_scale();

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

    var bar = svg.selectAll(".bar")
	.data(self.hist_bins)
	.enter().append("g")
	.attr("class", "bar")    
	.attr("transform", function(d) { 
	    return "translate(" + self.x(d.x) + "," + self.y(d.y) + ")"; 
	});
    
    bar.append("rect")
	.attr("x", 1)
	.attr("width", this.x(this.hist_bins[0].dx) - 1)
	.attr("height", function(d) { return self.height - self.y(d.y); });

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

hist.prototype.add = function(other) { 

    // Add another histogram to this one

    if( other.bins != this.bins ) {
	console.log("Cannot add histograms, bins don't match");
	return;
    }
    if( other.var_min != this.var_min ) {
	console.log("Cannot add histograms, minimums don't match");
	return;
    }
    if( other.var_max != this.var_max ) {
	console.log("Cannot add histograms, maximums don't match");
	return;
    }


    if( other.hist_bins == null ) {
	console.log("Cannot add histograms, RHS hasn't been filled yet");
    }

    // If 'this' hasn't been filled yet, we just fill it with
    // the contents of the other histogram
    // I think that's the behavior we want.
    if( this.hist_bins == null ) {
	this.hist_bins = other.hist_bins;
	return;
    }

    if( this.hist_bins.length != other.hist_bins.length ) {
	console.log("Error: Histograms Bins don't match...");
    }


    for(var i=0; i < this.hist_bins.length; ++i) {

	var this_bin = this.hist_bins[i];
	var other_bin = other.hist_bins[i];

	// 'extend' this bin by the other's bin
	this_bin.push.apply(this_bin, other_bin)
    }

    console.log("Histograms successfully added");

}
