
const educationDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([
    d3.json(educationDataURL),
    d3.json(countyDataURL)
]).then(([educationData, countyData]) => {
    makeChoroplethMap(educationData, countyData);
}).catch(error => {
    console.error('Error loading the data:', error);
});

function makeChoroplethMap(educationData, countyData) {
    const [w, h, padding] = [1200, 800, 80];

    // Create the main SVG
    const svg = d3.select('body')
        .append('svg')
        .attr('id', 'choropleth')
        .attr('width', w)
        .attr('height', h);

    // Title
    svg.append('text')
        .attr('id', 'title')
        .attr('x', w / 2)
        .attr('y', padding / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '30px')
        .text('Educational Attainment in the United States');

    // Description
    svg.append('text')
        .attr('id', 'description')
        .attr('x', w / 2)
        .attr('y', padding)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)');

    const tooltip = d3.select('body').append('div')
        .attr('id', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border-radius', '5px')
        .style('padding', '10px')
        .style('box-shadow', '0 0 10px rgba(0, 0, 0, 0.5)')
        .style('pointer-events', 'none')
        .style('opacity', '0')
        .style('visibility', 'hidden');

    // Convert topojson to geojson
    const counties = topojson.feature(countyData, countyData.objects.counties).features;

    // Create color scale
    const colorScale = d3.scaleQuantize()
        .domain(d3.extent(educationData, d => d.bachelorsOrHigher))
        .range(d3.schemeBlues[9]);

    // Create legend
    const legendWidth = 300;
    const legendHeight = 20;
    const legendPadding = 40;

    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${w - legendWidth - padding}, ${h - padding})`);

    const legendScale = d3.scaleLinear()
        .domain(d3.extent(educationData, d => d.bachelorsOrHigher))
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .tickValues(colorScale.range().map(d => colorScale.invertExtent(d)[0]))
        .tickFormat(d3.format(".1f"));

    legend.selectAll('rect')
        .data(colorScale.range().map(d => colorScale.invertExtent(d)))
        .enter()
        .append('rect')
        .attr('x', d => legendScale(d[0]))
        .attr('y', 0)
        .attr('width', d => legendScale(d[1]) - legendScale(d[0]))
        .attr('height', legendHeight)
        .attr('fill', d => colorScale(d[0]));

    legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendAxis);

    // Draw counties
    svg.append('g')
        .attr('transform', `translate(0, ${padding})`)
        .selectAll('path')
        .data(counties)
        .enter()
        .append('path')
        .attr('class', 'county')
        .attr('d', d3.geoPath())
        .attr('fill', d => {
            const result = educationData.find(ed => ed.fips === d.id);
            return result ? colorScale(result.bachelorsOrHigher) : '#ccc';
        })
        .attr('data-fips', d => d.id)
        .attr('data-education', d => {
            const result = educationData.find(ed => ed.fips === d.id);
            return result ? result.bachelorsOrHigher : 0;
        })
        .on('mouseover', (event, d) => {
            const result = educationData.find(ed => ed.fips === d.id);
            tooltip
                .style('visibility', 'visible')
                .style('opacity', '0.9')
                .attr('data-education', result ? result.bachelorsOrHigher : 0)
                .html(() => result ?
                    `${result.area_name}, ${result.state}: ${result.bachelorsOrHigher}%` :
                    'No data available')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', () => {
            tooltip
                .style('visibility', 'hidden')
                .style('opacity', '0');
        });
}
