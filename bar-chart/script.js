//Get data
const data = await d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json");
console.log(data);
makeChart(data.data)

function makeChart(ds) {
    const margin = {top: 30, right: 30, bottom: 50, left: 50},
                    width = 960 -  margin.left - margin.right, 
                    height = 500 - margin.top - margin.bottom; 
    
    const parseTime = d3.timeParse("%Y-%m-%d");

    const x = d3.scaleTime().range([0,width]);
    const y = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    

}