//
// The class
//

// Declare the 'hist' class
function hist(name, num_bins, var_min, var_max) {
    
    this.name = name;
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

hist.prototype._copy_scale = function(hist) {

    // Copy the scale of 'this' histogram 
    // to the target histogram: 'hist'
    hist.margin = this.margin;
    hist.width = this.width;
    hist.height = this.height;

    hist.x = this.x;
    hist.y = this.y;

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


hist.prototype._draw_bins = function(svg) {

    // This function takes an "svg" canvas thingy,
    // and it gets this 'hist' instance's bin array,
    // adds bins to the svg, and gives them a class
    // based on this histogram's name

    var self = this;

    // Update the scale for drawing
    //self._update_scale();

    // Not sure what this does...
    var formatCount = d3.format(",.0f");

    // Grab the data of the class 'bar'
    // But, also add the name
    var bar_selector = ".bar ." + this.name;

    // Add the hist bins to the svg
    var bar = svg.selectAll(bar_selector)
	.data(self.hist_bins)
	.enter().append("g")
	.attr("class", "bar " + this.name)    
	//.attr("class", this.name)    
	.attr("transform", function(d) { 
	    return "translate(" + self.x(d.x) + "," + self.y(d.y) + ")"; 
	});
    
    // And then do some formatting
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
    self._update_scale();

    // Create the x axis
    var xAxis = d3.svg.axis()
	.scale(this.x)
	.orient("bottom");

    // Get the div and add a 'svg' canvas
    var svg = d3.select(selector).append("svg")
	.attr("width", this.width + this.margin.left + this.margin.right)
	.attr("height", this.height + this.margin.top + this.margin.bottom)
	.append("g")
	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    // Use the dedicated method to draw
    this._draw_bins(svg);

    /*

    // Grab the data of the class 'bar'
    // But, also add the name
    var bar_selector = ".bar ." + this.name;


    var bar = svg.selectAll(bar_selector)
	.data(self.hist_bins)
	.enter().append("g")
	.attr("class", "bar " + this.name)    
	//.attr("class", this.name)    
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
    */
    
    // Add the axis to the svg
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

	if( this_bin.x != other_bin.x ) {
	    console.log("Error: Histogram bin centers don't match...");
	    return;
	}
	if( this_bin.dx != other_bin.dx ) {
	    console.log("Error: Histogram bin widths don't match...");
	    return;
	}

	// 'extend' this bin by the other's bin
	this_bin.push.apply(this_bin, other_bin)

	// Update the y values
	this_bin.y += other_bin.y;
	
    }

    console.log("Histograms successfully added");

}

//
//
//


// Declare the 'hist' class
function stack() {

    // The [0] index in the array is
    // the histogram on the bottom
    this.hist_list = new Array();

    // Calculate the boundaries
    this.margin = {top: 10, right: 30, bottom: 30, left: 30},
    this.width = 960 - this.margin.left - this.margin.right,
    this.height = 500 - this.margin.top - this.margin.bottom;

}

stack.prototype.add_hist = function(hist) {
    this.hist_list.push(hist);
}

stack.prototype.draw = function(selector) {

    // Create the axis and svg
    
    // javascript kinda sucks... sorry...
    var self = this;

    // To 'stack' histograms, we just add them.
    var stacked_list = new Array();
    for( var i=0; i < this.hist_list.length; ++i ) {

	// Make a copy of the histogram
	var tmp_hist = this.hist_list[i]; //JSON.parse(JSON.stringify(this.hist_list[i]));

	// Now, loop over the histograms 'below' it
	// and add their contents
	for( var j=i-1; j >= 0; --j ) {
	    console.log("Stacking hists: " + i + " " + j);
	    tmp_hist.add(this.hist_list[j]);
	}

	stacked_list.push(tmp_hist);
    }

    // Now, based on the stacking,
    // we draw the histograms

    // Pick the last histogram as the template
    // (since it is the tallest)
    var template = stacked_list[ stacked_list.length-1 ];

    // Set the scale of the template
    template._update_scale();
    
    // Now copy that scale to all the other histograms
    // to ensure that they are all drawn on the same scale
    for( var i=0; i < stacked_list.length; ++i ) {
	template._copy_scale(stacked_list[i]);
    }

    // Update the scale for drawing
    // this._update_scale();

    // Create the x axis
    var xAxis = d3.svg.axis()
	.scale(template.x)
	.orient("bottom");

    // Get the div and add a 'svg' canvas
    var svg = d3.select(selector).append("svg")
	.attr("width", template.width + template.margin.left + template.margin.right)
	.attr("height", template.height + template.margin.top + template.margin.bottom)
	.append("g")
	.attr("transform", "translate(" + template.margin.left + "," + template.margin.top + ")");


    // Loop over the internal histogram and draw their bins
    /*
    for( var i=0; i < this.hist_list.length; ++i ) {
	this.hist_list[i]._draw_bins(svg);
    }
    */
    for( var i=0; i < stacked_list.length; ++i ) {
	var hist_idx = stacked_list.length - i - 1;
	stacked_list[hist_idx]._draw_bins(svg);
    }

    // Finalize
    // Add the axis to the svg
    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + template.height + ")")
	.call(xAxis);

    return this;

}
