

function countrySpecificBar(country, gender){

    var parseDate = d3.timeParse("%Y-%m-%d");
    let margin = {
        top: 20,
        right: 30,
        bottom: 0,
        left: 55
    },
    width = document.getElementById('timelineDiv').offsetWidth - margin.left - margin.right,
    height = document.getElementById('timelineDiv').offsetHeight*0.8 - margin.top - margin.bottom,
    node
    let data = []
    if(country == "total"){
        temp_data = data_year.filter(function(item){
            return item.year >= 1995 & typeof item.name !== 'undefined'})
    }
    else{
        if(country == "USA"){
            country = "United States Of America"
        }
         temp_data = data_year.filter(function(item){
            return item.name == country & item.year >= 1995})
    }
    if(gender != "All"){
         temp_data = temp_data.filter(function(item){
            return item.gender == gender})
    }
    var result = [];
    temp_data.reduce(function(res, value) {
       if (!res[value.year]) {
            res[value.year] = { year: value.year, count_song: 0};
            data.push(res[value.year])
          }
      res[value.year].count_song +=  value.count_song
      return res;
    }, {});

    var min_X = d3.min(data, function(d) { return d["year"]; }),
        max_X = d3.max(data, function(d) { return d["year"]; }),
        max_Y = d3.max(data, function(d) { return d["count_song"]; });

    let ordinals = []

    d3.selectAll('#timelineNode').selectAll('*').remove()        

    var svg = d3.select('#timelineNode')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height*.8 + margin.top + margin.bottom )
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`)
                // .call(
                //     d3.zoom()
                //     .translateExtent([[0,0], [width, height]])
                //     .extent([[0, 0], [width, height]])
                //     .on('zoom', zoom)
                // )
    

    // the scale

    const chart = svg.append('g')
        .attr('height', height)
      .attr('transform', `translate(${margin.left}, ${margin.top + 10})`);
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    const xScale = d3.scaleBand()
      .range([0, width- 2* margin.right])
      .domain(range(1995,max_year,1))
      .padding(0.2)
    const yScale = d3.scaleLinear()
      .range([height , 0])
      .domain([0, max_Y]);



    const makeYLines = () => d3.axisLeft()
      .scale(yScale)

    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    chart.append('g')
      .call(d3.axisLeft(yScale));



    chart.append('g')
      .attr('class', 'grid')
      .call(makeYLines()
        .tickSize(-width + 2* margin.right, 0, 0)
        .tickFormat('')
      )

    const barGroups = chart.selectAll()
      .data(data)
      .enter()
      .append('g')

    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (g) => xScale(g.year))
      .attr('y', (g) => yScale(g.count_song))
      .attr('height', (g) => height - yScale(g.count_song))
      .attr('width', xScale.bandwidth())
      .on('mouseenter', function (actual, i) {
        d3.selectAll('.value')
          .attr('opacity', 0)

        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', .6)
          .attr('x', (a) => xScale(a.year) - 5)
          .attr('width', xScale.bandwidth() + 10)

        const y = yScale(actual.count_song)

        line = chart.append('line')
          .attr('id', 'limit')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', width- 2* margin.right)
          .attr('y2', y)

        barGroups.append('text')
          .attr('class', 'divergence')
          .attr('x', (a) => xScale(a.year) + xScale.bandwidth() / 2)
          .attr('y', (a) => yScale(a.count_song) - 5)
          .attr('fill', 'white')
          .attr('text-anchor', 'middle')
          .text((a, idx) => {
            const divergence = (a.count_song - actual.count_song)
            
            let text = ''
            if (divergence > 0) text += '+'
            text += `${divergence}`

            return idx !== i ? text : '';
          })

      })
      .on('mouseleave', function () {
        d3.selectAll('.value')
          .attr('opacity', 1)

        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', 1)
          .attr('x', (a) => xScale(a.year))
          .attr('width', xScale.bandwidth())

        chart.selectAll('#limit').remove()
        chart.selectAll('.divergence').remove()
      })

    barGroups 
      .append('text')
      .attr('class', 'value')
      .attr('x', (a) => xScale(a.year) + xScale.bandwidth() / 2)
      .attr('y', (a) => yScale(a.count_song) - 5)
      .attr('text-anchor', 'middle')
      .text((a) => `${a.count_song}`)
    
    svg
      .append('text')
      .attr('class', 'label')
      .attr('x', -(height / 2) - margin.left)
      .attr('y', "0px")
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Number of songs')

    svg.append('text')
      .attr('class', 'label')
      .attr('x', width / 2 + margin.left)
      .attr('y', height + margin.top * 3.2)
      .attr('text-anchor', 'middle')
      .text('Years')

    svg.append('text')
      .attr('class', 'title')
      .attr('x', width / 2)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .text('Number of songs in ' + country + ' from 1995 to ' + max_year + " ("+gender+")")

}