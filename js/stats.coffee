###
Basic Statistics Library. I'm using it to experiment with a visualization of
the central limit theorem.

@author: Chris Barna <chris@unbrain.net>
###

###
Stats class! Only implements a few methods.
###

root = exports ? this

class Stats
  constructor: (@data=[], @sample=false) ->

  append: (datum) ->
    @data.push(datum)

  selectSample: (sampleSize) ->
    sample = []
    tmp_population = @data.slice()

    if sampleSize > tmp_population.length
      console.log("Warning: sampleSize is larger than the total data. Truncating...")
      sampleSize = tmp_population.length

    for i in [1..sampleSize]
      j = Math.floor(Math.random() * tmp_population.length)

      sample.push(tmp_population[j])
      tmp_population.splice(j, 1)

    new Stats(sample, true)

  # Calculate the mean of the population.
  calculateMean: ->
    mean = 0

    for val in @data
      mean += val

    mean/@data.length

  # Calculate Sigma
  calculateStdDev: ->
    sigma = 0
    mu = this.calculateMean()

    for yi in @data
      sigma += Math.pow((yi - mu), 2)

    # Are we calculating the sample or the population stdDev?
    n = if @sample then @data.length-1 else @data.length

    sigma = sigma/n
    Math.sqrt(sigma)

roundDecimals = (num) ->
  Math.round(num*1000)/1000
###
The data viz part!
###

# Frequency Distribution
freqchart_height = 200
freqchart = d3.select("#frequency .chart").append("svg")
  .attr("width", 620).attr("height", freqchart_height)

# Make the axes
freqchart.append("line")
  .attr("y1", 10).attr("y2", freqchart_height-5)
  .attr("x1", 20).attr("x2", 20)
  .attr("stroke", "#000")

freqchart.append("line")
  .attr("x1", 20).attr("x2", 620)
  .attr("y1", freqchart_height-10).attr("y2", freqchart_height-10)
  .attr("stroke", "#000")

# Ticks
# X
x_ticks = freqchart.selectAll("g.x_ticks")
  .data(((num)*20 for num in [0...30])).enter()
  .append("g").attr("class", "x_ticks")
  .attr("pointer-events", "none")

x_ticks.append("line")
  .attr("x1", (d) -> d+40).attr("x2", (d) -> d+40)
  .attr("y1", freqchart_height-5).attr("y2", freqchart_height-10)
  .attr("stroke", "#000")

x_ticks.append("text")
  .attr("x", (d) -> d+30)
  .attr("y", freqchart_height)
  .attr("text-anchor", "middle")
  .attr("class", "tick_text")
  .text((d,i) -> i+1)

# Y
y_ticks = freqchart.selectAll("g.y_ticks")
  .data(((num*18) for num in [0..10])).enter()
  .append("g").attr("class", "y_ticks")
  .attr("pointer-events", "none")

y_ticks.append("line")
  .attr("x1", 15).attr("x2", 20)
  .attr("y1", (d) -> d+10).attr("y2", (d) -> d+10)
  .attr("stroke", "#000")

y_ticks.append("text")
  .attr("x", 15).attr("y", (d) -> freqchart_height-d-6)
  .text((d,i) -> i*2)
  .attr("class", "tick_text")
  .attr("text-anchor", "end")

# Rects
freqchart.selectAll("rect.dist").data(((num)*20 for num in [0..29])).enter()
  .append("rect")
  .attr("x", (d) -> d+21)
  .attr("y", 181)
  .attr("class", "dist")
  .attr("width", 19).attr("height", 9)
  .attr("pointer-events","all")
  .attr("fill", "lightBlue").attr("id", (d, i) -> "box-"+(i+1))

# Calculate the data array
calculateDataArray = ->
  tmp_array = []

  freqchart.selectAll("rect")
    .each((d,i) ->
      height = d3.select(this).attr("height")
      value = Math.floor(height/9)

      for num in [0...value]
        tmp_array.push(i+1)
    )

  return new Stats(tmp_array)

pop_data = calculateDataArray()
samplegroup = freqchart.selectAll("#frequency .chart svg").data([1]).enter()
  .append("g")
  .attr("class", "samplestuff")

# Mean Line
freqchart.selectAll("line.mean").data([pop_data.calculateMean()]).enter()
  .append("line")
  .attr("y1", 10).attr("y2", freqchart_height-10)
  .attr("x1", (d) -> d*20).attr("x2", (d) -> d*20)
  .attr("stroke", "#333")
  .attr("class", "mean")

$("#freq-mean").html(roundDecimals(pop_data.calculateMean()))
$("#freq-stddev").html(roundDecimals(pop_data.calculateStdDev()))

# Visualize a specific sample.
showSample = (sample) ->
  frequencies = calculateFrequencies(sample)
  console.log(frequencies)

  samplegroup.selectAll("rect.sample").remove()

  samplegroup.selectAll("rect.sample").data(frequencies).enter()
    .append("rect")
    .attr("x", (d,i) -> (i*20)+21)
    .attr("y", freqchart_height-10).attr("height", 0)
    .attr("width", 19)
    .transition().attr("y", (d,i) ->
      if typeof(d) is "undefined"
        0
      else
        freqchart_height - (d*9) - 10)
    .attr("class", "sample")
    .attr("height", (d,i) ->
      if typeof(d) is "undefined"
        0
      else
        d*9)
    .attr("fill", "Blue")
  console.log(frequencies)


# Convert from a data array to an array of frequencies.
calculateFrequencies = (data) ->
  tmp_array = []
  for i in data
    i = Math.floor(i)
    if typeof(tmp_array[i-1]) isnt "number"
      tmp_array[i-1] = 1
    else
      tmp_array[i-1] += 1

  return tmp_array

# Follow people around when they drag.
clickDragEvent = (d, i) ->
  xy = d3.svg.mouse(this)
  boxNum = Math.ceil((xy[0]-20)/20)

  newHeight = freqchart_height - (Math.floor(xy[1]/9)*9) - 11

  if newHeight >= freqchart_height - 20
    newHeight = freqchart_height - 20

  if newHeight < 0
    newHeight = 0

  newY = freqchart_height- newHeight - 10
  freqchart.select("g.samplestuff rect.sample").data([]).exit()
    .remove()

  freqchart.select("#box-"+boxNum)
    .transition().delay(0).duration(150)
    .attr("height", newHeight).attr("y", newY)


  samplegroup.selectAll("rect.sample").transition()
    .attr("height", 0).attr("y", 190).remove()
  # Run calculations on our new population data.
  pop_data = calculateDataArray()
  $("#freq-mean").html(roundDecimals(pop_data.calculateMean()))
  $("#freq-stddev").html(roundDecimals(pop_data.calculateStdDev()))

  freqchart.selectAll("line.mean").data([pop_data.calculateMean()])
    .transition()
    .attr("x1", (d) -> d*20).attr("x2", (d) -> d*20)

  # Reset the sampling
  sampling_means.data = []
  samplingchart.selectAll("rect.dist")
    .transition().attr("height", 0).attr("y", 190)
  samplingchart.selectAll("line.mean")
    .attr("x1", -1).attr("x2", -1)
  updateSamplingGraph()

  # Update the range
  $("#sample-range").attr("max", pop_data.data.length)

  if parseInt($("#sample-range").val()) >= pop_data.data.length
    $("#sample-range").val(pop_data.data.length)
    $("#sample-size").html($("#sample-range").val())
  $("#sample-max").html($("#sample-range").attr("max"))

  return

freqchart.on("mousedown", (d,i) ->
  clickDragEvent.bind(this).call(d,i)
  freqchart.on("mousemove", clickDragEvent)
  return )

# Remove the event when the mouse stops clicking or the mouse leaves the box.
freqchart.on("mouseup", (d, i) ->
  freqchart.on("mousemove", (d, i) -> return))

freqchart.on("mouseout", (d, i) ->
  coords = d3.svg.mouse(this)

  if 0 > coords[0] or coords[0] > 620 or 0 > coords[1] or coords[1] > freqchart_height
    freqchart.on("mousemove", (d, i) -> this)
  )

# Sampling Distribution
sampling_means = new Stats([])

samplingchart_height = 200
samplingchart = d3.select("#sampling .chart").append("svg")
  .attr("width", 620).attr("height", samplingchart_height)

# Make the axes
# samplingchart.append("line")
  # .attr("y1", 10).attr("y2", samplingchart_height-5)
  # .attr("x1", 20).attr("x2", 20)
  # .attr("stroke", "#000")

samplingchart.append("line")
  .attr("x1", 20).attr("x2", 620)
  .attr("y1", freqchart_height-10).attr("y2", samplingchart_height-10)
  .attr("stroke", "#000")

# X-Axis
x_sampling = samplingchart.selectAll("g.x_ticks")
  .data(((num)*20 for num in [0...30])).enter()
  .append("g").attr("class", "x_ticks")
  .attr("pointer-events", "none")

x_sampling.append("line")
  .attr("x1", (d) -> d+40).attr("x2", (d) -> d+40)
  .attr("y1", samplingchart_height-5).attr("y2", samplingchart_height-10)
  .attr("stroke", "#000")

x_sampling.append("text")
  .attr("x", (d) -> d+30)
  .attr("y", samplingchart_height)
  .attr("text-anchor", "middle")
  .attr("class", "tick_text")
  .text((d,i) -> i+1)

# Rects
samplingchart.selectAll("rect.dist").data(((num)*20 for num in [0..29])).enter()
  .append("rect")
  .attr("x", (d, i) -> (i*20)+21)
  .attr("y", 190)
  .attr("class", "dist")
  .attr("width", 19).attr("height", 0)
  .attr("pointer-events","all")
  .attr("fill", "DodgerBlue").attr("id", (d, i) -> "sampling-"+(i+1))

# Mean Line

# Update Sampling Graph
updateSamplingGraph = () ->
  freqs = calculateFrequencies(sampling_means.data)
  freq_vals = freqs.slice().filter((e) -> (typeof(e) isnt "undefined"))
  max = Math.max.apply(Math, freq_vals)

  samplingchart.selectAll("rect.dist").data(freqs)
    .attr("x", (d,i) -> (i*20)+21)
    .attr("width", 19).transition()
    .attr("y", (d,i) ->
      if typeof(d) is "undefined"
        0
      else
        freqchart_height - ((d/max)*190 - 10) - 10)
    .attr("height", (d,i) ->
      if typeof(d) is "undefined"
        0
      else
        (d/max)*190 - 10 )
    .attr("class", "dist")


  unless isNaN(sampling_means.calculateMean())
    samplingchart.selectAll("line.mean").data([sampling_means.calculateMean()])
      .enter().append("line").attr("class", "mean")

    samplingchart.selectAll("line.mean").data([sampling_means.calculateMean()])
      .attr("y1", 10).attr("y2", freqchart_height-10)
      .attr("x1", (d) -> d*20).attr("x2", (d) -> d*20)
      .attr("stroke", "#333")
      .attr("class", "mean")
  return

# UI elements.
sampleClick = ->
  sample = pop_data.selectSample($("#sample-range").val())
  sampling_means.append(sample.calculateMean())

  # Update the single sample
  $("#sample-mean").html(roundDecimals(sample.calculateMean()))
  $("#sample-stddev").html(roundDecimals(sample.calculateStdDev()))

  showSample(sample.data)

  # Update the sample means
  $("#sampling-n").html(sampling_means.data.length)
  $("#sampling-mean").html(roundDecimals(sampling_means.calculateMean()))
  $("#sampling-stddev").html(roundDecimals(sampling_means.calculateStdDev()))

  updateSamplingGraph()

$("#sample-button").click(sampleClick)
$("#sample-10").click(->
  for i in [1..10]
    sampleClick()
  return )
$("#sample-25").click(-> sampleClick() for i in [1..25]; return)
$("#sample-100").click(-> sampleClick() for i in [1..100] )
$("#sample-range").change( ->
  $("#sample-size").html($(this).val())
)
$("#sample-range").attr("max", pop_data.data.length)
