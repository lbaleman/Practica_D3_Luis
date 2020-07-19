

d3.json('https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/d9f3a11cfa08154c36623c1bf01537bb7b022491/practica.json')
.then((madrid) => {
  drawMap(madrid);
})

//let feature;

function drawMap(featureCollection) {
  const width = 1000;
  const height = 1000;
  const border = 100;

  const svg = d3.select('#map')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // Cogemos  las features, en este caso como se trata de una colección únicamente
  // no necesitamos  la librería de topojson.
  const features = featureCollection.features;//LO TENGO

  
  // Calculamos el  precio máximo
  const priceMax = d3.max(features, d => d.properties.avgprice);
  
  
  // En esta proyección para usarla de forma genérica y no tener que buscar
  //  una  coordenada céntrica  en la  que centrar el mapa, voy a usar el centro de
  // la colección y para ello uso el método geoCentroid, podríamos pasar las coordenadas de
  // sol también como aprendimos en clase
  const center = d3.geoCentroid(featureCollection);//LO TENGO

  // Con fitsize, le  pasamos el array con el ancho y el alto que  va a usar
  // y la colección y ajustará el tamaño a nuestro mapa, para poder calcularlo
  // automáticamente, podríamos dar un valor también con el .scale como vimos en clase
  const projection = d3.geoMercator()//LO TENGO
    .fitSize([width - border, height - border], featureCollection)
    .center(center)
    .translate([width/2, height/2]);//LO TENGO

  
  // Con la proyección ya puedo generar mi path
  const path = d3.geoPath().projection(projection);//LO TENGO

  // Por cada una de las feature  creo un path
  feature = svg.selectAll('.feature')
    .data(features)
    .enter()
    .append('path')

  
  feature
    .attr('d', path)
    // Relleno el color   de mi path con la función fillColor
    .attr('fill', fillColor);

  // Voy a crear un g donde pondré mi leyenda
  const legend = svg.append('g')
  .attr('class', 'legend');

  // Quiero usar  5 colores en mi leyenda, con 5 precios
  const numberOfLegends =  5;
  
  // Con esta  escala  lineal sacaremos cada uno de los puntos 
  // donde pondremos los colores, lo multiplicamos por 2, por que vamos a utilizar
  // rectángulos y en el eje X, tendremos que  tener en cuenta una coordenada x y un width
  const scaleLegend = d3.scaleLinear()
    .domain([0, numberOfLegends * 2])
    .range([0, width]);


  for (let index = 0; index < numberOfLegends * 2; index+=2) {//index+2 para pintar solamente 5
    //  Guardo  en posX  la coordenada "x" que la obtengo de la escala
    const posX = scaleLegend(index);

    const percent = index / (numberOfLegends * 2 - 2);

    //Calculamos el ancho de la leyenda
    const widthLegendRect = (width / numberOfLegends) - 2;
    
    //Creamos un g donde introduciremos el rectangulo y el texto de la leyenda, ya que con g es mas facil de mover
    const legendGroup = legend
      .append('g')
      .attr('transform', `translate(${posX}, 0)`);//porque estamos en la y0
    
    //Ahora, metemos los rectangulos
    legendGroup
      .append('rect')
      .attr('width', widthLegendRect)
      .attr('height', 15)
      .attr('fill', d3.interpolateCividis(percent))
    
      legendGroup
      .append('text')
      .text(`${priceMax * percent} €/m2`)
      // Es necesario usar function y  no arrow function, por que necesitamos el this
      .attr('transform', function(d) {
        const textLength = this.getComputedTextLength();
        const middle = widthLegendRect / 2;
        return `translate(${middle - textLength / 2}, 30)`;
      });
  }

  function fillColor(d) {
    const price = d.properties.avgprice || 0;
    return d3.interpolateCividis(price / priceMax);
  }

}