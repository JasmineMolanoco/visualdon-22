import * as d3 from 'd3';


//Création du canva SVG
var svg = d3.select("body")
        .append("svg")
        .attr("width", 1200)
        .attr("height", 400)
        .style('background-color', 'transparent')


//Création d'un groupe qui va comporter les cercles et les textes
const group1 = svg.append("g")
        .append("svg")

const group2 = svg.append("g")
        .append("svg")

const group3 = svg.append("g")
        .append("svg")


//Création des textes liés au groupes
const text1 = group1.append("text")
        .attr("x", "60")
        .attr("y", "100")
        .text("hello world!")

const text2 = group2.append("text")
        .attr("x", "160")
        .attr("y", "200")
        .text("(°v°)")

const text3 = group3.append("text")
        .attr("x", "190")
        .attr("y", "305")
        .text("Clique ici.")


//Création des cercles liés au groupes
const circle1 = group1.append("circle")
        .attr("cx", "50")
        .attr("cy", "50")
        .attr("r", "40")
        .attr("transform", "translate (50,0)")

const circle2 = group2.append("circle")
        .attr("cx", "200")
        .attr("cy", "150")
        .attr("r", "40")
        .attr("fill", "lightblue")

const circle3 = group3.append("circle")
        .attr("cx", "250")
        .attr("cy", "250")
        .attr("r", "40")


//Pour aligner les cercles verticalement (sans bouger les textes)
circle3.on("click", () => {
        circle1.attr("cx", 350);
        circle2.attr("cx", 400);
        circle3.attr("cx", 400);
})


//Création d'un groupe pour notre histogramme de rectangles selon les hauteurs ci-dessous
const data = [20, 5, 25, 8, 15]
const x1= 10;

const myDiv = d3.select(".my-div")
        .append("svg")
        .attr("width", 1200)
        .attr("height", 100)
        .style('background-color', 'transparent')

const divRect = myDiv.append("svg")
        

divRect.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
                .attr("x", (d,i) => i * 30)
                .attr("y", (d) => divRect.attr("height") - d+50)
                .attr("width", 20)
                .attr("height", d => d)
                .attr('fill', 'lightblue')

