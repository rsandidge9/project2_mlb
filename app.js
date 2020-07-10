var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenYAxis = "TC_Total_WAR";

// function used for updating x-scale var upon click on axis label
function yScale(sourceData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(sourceData, d => d[chosenYAxis]) * 0.8,
      d3.max(sourceData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, width]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  leftAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenYAxis, circlesGroup) {

  var label;

  if (chosenYAxis === "TC_Total_WAR") {
    label = "Team Controlled WAR:";
  }
  else {
    label = "Career WAR:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.Current_Franchise}<br>${label} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("Test_Rays.csv").then(function(sourceData, err) {
  if (err) throw err;

  // parse data
  sourceData.forEach(function(data) {
    data.TC_Total_WAR = +data.TC_Total_WAR;
    data.Career_Total_WAR = +data.TC_Total_WAR;
  });

  // yLinearScale function above csv import
  var yLinearScale = yScale(sourceData, chosenYAxis);

  // Create x scale function
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(sourceData, d => d.Year), d3.max(sourceData, d => d.Year)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(leftAxis);

  // append x axis
  chartGroup.append("g")
    .call(bottomAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(sourceData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.Year))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var TC_WAR = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "TC_Total_WAR") // value to grab for event listener
    .classed("active", true)
    .text("Team Controlled WAR");

  var Career_WAR = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "Career_Total_WAR") // value to grab for event listener
    .classed("inactive", true)
    .text("Career WAR");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Year");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(sourceData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "TC_Total_WAR") {
            TC_WAR
            .classed("active", true)
            .classed("inactive", false);
            Career_WAR
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            TC_WAR
            .classed("active", false)
            .classed("inactive", true);
            Career_WAR
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
