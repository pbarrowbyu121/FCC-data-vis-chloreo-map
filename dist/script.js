/* THINGS LEARNED
1) additional exposure to svg and d3
2) working with topoJSON data, youtube video by Ganesh was particularly helpful
3) Learned new .find function to find the matching county data

IMPROVEMENTS
1) get tooltip to move with arrow and county
2) add axis to legend 
*/

//NOTES
/*

topojson documentation:
https://github.com/topojson/topojson

COLOR SCALE GENERATOR:
https://hihayk.github.io/scale/#4/6/50/80/-51/67/20/14/228297/34/130/151/white

objects field with counties field has a polygon for each county. Each county has an id. It references the arcs in the counties to draw the lines to create the shape of the county.
The data is in topoJSON but needs to be in geoJSON. 
fips in education data corresponds to id in county data
*/

//DATA SOURCES
/* fips county code is like the county ID and is associated with the shape id in the countyURL*/
const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

/* color array dark to light */
const colArr = ["#0F0D50",
"#112062",
"#163C74",
"#1C5C86",
"#228297",
"#3EA7A6",
"#5AB6A4",
"#77C4A7",
"#94D2AF",
"#B2E0BD",
"#D1EDD2"];

let countyData;
let educationData;

let canvas = d3.select("#canvas");
const tooltip = document.getElementById('tooltip');

let createMap = () => {

  /* min and max bachelors degree percentage */
  const minPerc = d3.min(educationData, d => d.bachelorsOrHigher);
  const maxPerc = d3.max(educationData, d => d.bachelorsOrHigher);

  /* puts percents on a scale to map to the color scheme array, the DARKER the color, the HIGHER the percentage */
  const colScale = d3.scaleLinear().
  domain([minPerc, maxPerc]).
  range([colArr.length, 0]);

  /* function to return the color from the color array given a percentage */
  function getColor(input) {
    return colArr[Math.floor(colScale(input))];
  }

  // LEGEND
  const legendHeight = 40;
  const legendWidth = 200;
  const legendPadding = 10;

  let legend = canvas.
  append("g").
  attr('class', 'key').
  attr('id', 'legend').
  attr('transform', 'translate(600,30)');

  const legendScale = d3.scaleLinear().
  domain([minPerc, maxPerc]).
  range([legendPadding, legendWidth - legendPadding]);

  legend.selectAll("rect").
  data(colArr).
  enter().
  append("rect").
  attr("height", 40).
  attr("width", legendWidth / colArr.length).
  attr("x", d => (colArr.length - colArr.indexOf(d)) * legendWidth / colArr.length).
  attr("y", legendPadding).
  style("fill", d => d);

  // MAP OF COUNTIES WITH TOOLTIP
  canvas.selectAll("path").
  data(countyData).
  enter().
  append("path").
  attr("d", d3.geoPath()).
  attr("class", "county").
  attr("data-fips", d => d.id).
  attr("data-education", d => {
    var matchingCounty = educationData.find(element => element.fips === d.id);
    return matchingCounty.bachelorsOrHigher;
  }).
  attr("fill", countyDataItem => {
    var matchingCounty = educationData.find(element => element.fips === countyDataItem.id);
    return getColor(matchingCounty.bachelorsOrHigher);
  }).
  on("mouseover", (event, d) => {
    var matchingCounty = educationData.find(element => element.fips === d.id);
    tooltip.classList.add("show");
    tooltip.style.left = "15px";
    tooltip.style.top = "15px";
    tooltip.setAttribute("id", "tooltip");
    tooltip.setAttribute("data-education", matchingCounty.bachelorsOrHigher);
    tooltip.innerHTML = `${matchingCounty.bachelorsOrHigher}</br>${matchingCounty.area_name}`;
  }).
  on("mouseout", () => {
    tooltip.classList.remove("show");
  });
};

// IMPORT DATA
d3.json(countyURL).
then((data, error) => {
  if (error) {
    console.log(log);
  } else {
    /* topojson.feature takes two arguments. The first is the data, the second is what we're goingn to extract. We want to extract from objects and counties, only the features part*/
    countyData = topojson.feature(data, data.objects.counties).features;

    d3.json(educationURL).
    then((data, error) => {
      if (error) {
        console.log(error);
      } else {
        educationData = data;
        console.log(educationData[0].bachelorsOrHigher);
        /* once data is imported run the createMap method */
        createMap();
      }
    });
  }
});