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

    // Attributes
    this._color = "steelblue";
    this._show_values = true;
    this._data_points = false;

    // Calculate the boundaries
    this.margin = {top: 10, right: 30, bottom: 30, left: 30};
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    // Create the x and y scales
    // Create the x-axis mapping function
    this.x = d3.scale.linear()
	.domain([this.min, this.max])
	.range([0, this.width]);

    // Create the y-axis mapping function
    this.y = d3.scale.linear();

}

hist.prototype.clone = function() {

    var cloned_hist = new hist(this.name, this.bins, this.min, this.max);
    
    // Clone the array
    cloned_hist.hist_bins = this.hist_bins.slice();

    // Clone the margins
    cloned_hist.margin = this.margin; //.slice();
    cloned_hist.weight = this.weight;
    cloned_hist.width = this.width;
    
    // Cone the functions
    cloned_hist.x = this.x.bind({});
    cloned_hist.y = this.y.bind({});

    // Attributes
    cloned_hist._color = this._color;
    cloned_hist._show_values = this._show_values;
    cloned_hist._data_points = this._data_points;

    return cloned_hist;

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


hist.prototype.color = function(the_color) {
    this._color = the_color;
    return this;
}

hist.prototype.show_values = function(do_show_values) {
    this._show_values = do_show_values;
    return this;
}
hist.prototype.data_points = function(do_data_points) {
    this._data_points = do_data_points;
    return this;
}


// Simple function to set the data
hist.prototype.fill = function(values) { 

    // Generate a histogram using twenty uniformly-spaced bins.
    this.hist_bins = d3.layout.histogram().bins(this.x.ticks(this.bins))(values);
    return this;

}


hist.prototype._draw_bins = function(svg) {

    // This function takes an "svg" canvas thingy,
    // and it gets this 'hist' instance's bin array,
    // adds bins to the svg, and gives them a class
    // based on this histogram's name

    var self = this;

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

    if( self._data_points ) {
	bar.append("circle")
	    .attr("transform", function(d) { 
		return "translate(" + self.x(d.dx/2) + ",0)"; 
	    })
	    .attr("r", 4)
	    .attr("fill", "black");

    }
    else {
    
	// And then do some formatting
	bar.append("rect")
	    .attr("x", 1)
	    .attr("width", this.x(this.hist_bins[0].dx) - 1)
	    .attr("height", function(d) { return self.height - self.y(d.y); })
	    .attr("shape-rendering", "crispEdges")
	    .attr("fill", this._color);

	if( this._show_values ) {
	    bar.append("text")
		.attr("dy", ".75em")
		.attr("y", 6)
		.attr("x", this.x(this.hist_bins[0].dx) / 2)
		.attr("text-anchor", "middle")
		.text(function(d) { 
		    if( d.y == 0 ) return "";
		    return formatCount(d.y); 
		});
	}

    }

    return this;

}

hist.prototype._draw_axes = function(svg) {


    // Create the x axis
    var xAxis = d3.svg.axis()
	.scale(this.x)
	.orient("bottom");

    // Create the y axis
    var yAxis = d3.svg.axis()
	.scale(this.y)
	.orient("left");

    // Add the x axis to the svg
    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + this.height + ")")
	.call(xAxis);

    // Add the y axis to the svg
    svg.append("g")
	.attr("class", "y axis")
	//.attr("transform", "translate(2,0)")
	.call(yAxis);

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

    // Get the div and add a 'svg' canvas
    var svg = d3.select(selector).append("svg")
	.attr("width", this.width + this.margin.left + this.margin.right)
	.attr("height", this.height + this.margin.top + this.margin.bottom)
	.append("g")
	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Use the dedicated methods to draw
    this._draw_bins(svg);
    this._draw_axes(svg);

    return this;
}


// 
hist.prototype.drawSame = function(selector) {

    if( this.hist_bins == null ) {
	console.log("Cannot Draw histogram, it does not appear to be filled");
	return;
    }
    
    // javascript kinda sucks... sorry...
    var self = this;

    // Grab the svg in this selector
    var svg = d3.select(selector).select("svg");

    // Set the current scale to correspond to a histogram
    // that is already drawn on the pad
    // This is somewhat "hacky" for now, could be rethought later...

    // Update the scale for drawing
    self._update_scale();

    // Use the dedicated methods to draw
    this._draw_bins(svg);

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

stack.prototype._create_stacked_bins = function() {


    // To 'stack' histograms, we just add them.
    var stacked_list = new Array();
    //var data_list = new Array();
    for( var i=0; i < this.hist_list.length; ++i ) {

	// Make a copy of the histogram
	//var tmp_hist = this.hist_list[i]; //JSON.parse(JSON.stringify(this.hist_list[i]));
	var tmp_hist = this.hist_list[i].clone(); //JSON.parse(JSON.stringify(this.hist_list[i]));

	// Now, loop over the histograms 'below' it
	// and add their contents
	for( var j=i-1; j >= 0; --j ) {
	    console.log("Stacking hists: " + i + " " + j);
	    tmp_hist.add(this.hist_list[j]);
	}

	stacked_list.push(tmp_hist);
	//if( tmp_hist._show_data ) {
	//    data_list.push(tmp_hist);
	//}
    }

    return stacked_list;

}

stack.prototype.draw = function(selector) {

    // Create the axis and svg
    
    // javascript kinda sucks... sorry...
    var self = this;

    var stacked_list = this._create_stacked_bins();
    /*
    // To 'stack' histograms, we just add them.
    var stacked_list = new Array();
    var data_list = new Array();
    for( var i=0; i < this.hist_list.length; ++i ) {

	// Make a copy of the histogram
	//var tmp_hist = this.hist_list[i]; //JSON.parse(JSON.stringify(this.hist_list[i]));
	var tmp_hist = this.hist_list[i].clone(); //JSON.parse(JSON.stringify(this.hist_list[i]));

	// Now, loop over the histograms 'below' it
	// and add their contents
	for( var j=i-1; j >= 0; --j ) {
	    console.log("Stacking hists: " + i + " " + j);
	    tmp_hist.add(this.hist_list[j]);
	}

	stacked_list.push(tmp_hist);
	if( tmp_hist._show_data ) {
	    data_list.push(tmp_hist);
	}
    }
*/
    // Now, based on the stacking,
    // we draw the histograms

    // Pick the last histogram as the template
    // (since it is the tallest)
    var template = stacked_list[ stacked_list.length-1 ];

    // Set the scale of the template
    template._update_scale();

    // Now copy that scale to all the other histograms
    // to ensure that they are all drawn on the same scale
    // This is important, all histograms must use same scale
    for( var i=0; i < stacked_list.length; ++i ) {
	template._copy_scale(stacked_list[i]);
    }


    // Get the div and add a 'svg' canvas
    var svg = d3.select(selector).append("svg")
	.attr("width", template.width + template.margin.left + template.margin.right)
	.attr("height", template.height + template.margin.top + template.margin.bottom)
	.append("g")
	.attr("transform", "translate(" + template.margin.left + "," + template.margin.top + ")");

    console.log("SVG:");
    console.log(svg);

    // Loop over the internal histogram and draw their bins
    for( var i=0; i < stacked_list.length; ++i ) {
	var hist_idx = stacked_list.length - i - 1;
	stacked_list[hist_idx]._draw_bins(svg);
    }

    // Draw the axes (only need to to once)
    template._draw_axes(svg);

    return this;

}


stack.prototype.drawSame = function(selector) {

    // javascript kinda sucks... sorry...
    var self = this;

    // Grab the svg in this selector
    var svg = d3.select(selector).select("svg");

    var stacked_list = this._create_stacked_bins();

    var template = stacked_list[ stacked_list.length-1 ];

    // Set the scale of the template
    template._update_scale();
    for( var i=0; i < stacked_list.length; ++i ) {
	template._copy_scale(stacked_list[i]);
    }

    for( var i=0; i < stacked_list.length; ++i ) {
	var hist_idx = stacked_list.length - i - 1;
	stacked_list[hist_idx]._draw_bins(svg);
    }
    
    return this;
    
}



// Declare the 'canvas' class
function canvas(selector) {

    // A canvas is a convenient way to
    // plot multiple histograms on the
    // same plot and to update them
    // simultaneously

    // Calculate the boundaries
    this.margin = {top: 10, right: 30, bottom: 30, left: 30};
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    // create the svg
    this.svg = d3.select(selector).append("svg")
	.attr("width", this.width + this.margin.left + this.margin.right)
	.attr("height", this.height + this.margin.top + this.margin.bottom)
	.append("g")
	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    
    // The list of objects owned by this canvas
    this._object_list = new Array();

}


canvas.prototype.draw = function() {
    
    var self = this;

    if( this._object_list.length == 0 ) {
	console.log("Cannot draw canvas, no object added");
	return;
    }

    var template = this._object_list[0];

    // This is where we could change the scale...

    for(var i=0; i < this._object_list.length; ++i) {
	var obj = this._object_list[i];
	// Scale the histogram to match this canvas
	template._copy_scale(obj);
	// Draw it
	obj._draw_bins(self.svg);
    }

    template._draw_axes(svg);

    return this;

}
