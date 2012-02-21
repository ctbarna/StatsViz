###
Basic Statistics Library. I'm using it to experiment with a visualization of
the central limit theorem.

@author: Chris Barna <chris@unbrain.net>
###

###
Stats class! Only implements a few methods.
###

root = exports ? this
root.viz = viz ? {}

class root.Stats
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

root.viz.roundDecimals = (num) ->
  Math.round(num*1000)/1000
