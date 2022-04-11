import * as d3 from 'd3'
import allpib from '../data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv' //PIB par habitant par pays et pour chaque année depuis 1800
import lifeEsper from '../data/life_expectancy_years.csv' //espérance de vie par pays et pour chaque année depuis 1800
import population from '../data/population_total.csv' //population depuis 1800 par pays 
import "./index.css"

//------------------------------------------------------------------------------

//Modifier les data du nbPopulation de 2021, pour les rendre exploitables

population.forEach(pays => {
    (Object.keys(pays)).forEach(key => {
        if (typeof pays[key] == 'string' && key !== 'country') {
            pays[key] = strToInt(pays[key])
        }
    })
})

//Modifier les data du PIB de 2021, pour les rendre exploitables
let nbPib
allpib.forEach(pays => {
    if (typeof pays[2021] == 'string') {
        nbPib = strToInt(pays[2021])
        pays[2021] = nbPib
    }
})

//chercher les data les plus récentes pour les pays qui n'ont pas d'info en 2021
lifeEsper.forEach(pays => {
    if (pays[2021] == null) {
        let i = 2021
        do {
            i--
        } while (pays[i] == null);
        console.log('en année ', i, 'le pib de', pays['country'], 'était de', pays[i])
        pays[2021] = pays[i]
    }
})

//ajouter au body une div qui sera parent du svg, la rendre reconnaissable 
d3.select("body")
    .append("div")
    .attr('id', 'graph-stat-country')

//modifier la taille en fonction de la largeur de la fenêtre
let wDiv = document.querySelector("#graph-stat-country").offsetWidth
let hDiv = document.querySelector("#graph-stat-country").offsetHeight

//------------------------------------------------------------------------------

const margin = { top: 50, right: 50, bottom: 50, left: 50 }
const width = wDiv - margin.left - margin.right
const height = hDiv - margin.top - margin.bottom

//ajouter le svg au corps de la page (plus précisemment dans la div)
const svg = d3.select("#graph-stat-country")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 100)
    .append("g")
    //l'attribut transforme s'applique à l'élément et à ces enfants
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

//-------------------------------------------------------------------------------

//ajouter une couleur de fond grâce à un rectanlge
svg.append("rect")
    //définir la position (qui est héritée donc pas besoin d'être modifiée)
    .attr("x", 0)
    .attr("y", 0)
    //test d'attribut pour modifier les coins du rectangle
    // .attr("rx", 30) 
    // .attr("ry", 30) 
    .attr("height", height)
    .attr("width", width)
    .style("fill", "#151F30")

//------------------------------------------------------------------------------

//définir les dimensions de l'axe x, il faut aller au moins jusqu'au plus haut pib 
//programme doit récupérer le pib par habitant le plus élevé 
let maxPib = 0
allpib.forEach(pibByYear => {
    if (pibByYear[2021] > maxPib) {
        maxPib = pibByYear[2021]
    }
})
console.log("le pib par habitant le plus élevé est de : ", maxPib)

//définir les dimensions de l'axe y, programme doit récupérer la valeur la plus grande pour l'espérance de vie
let maxLifeLength = 0
lifeEsper.forEach(lifeEsperByYear => {
    if (lifeEsperByYear[2021] > maxLifeLength) {
        maxLifeLength = lifeEsperByYear[2021]
    }
})
console.log("la plus longue espérence de vie est de : ", maxLifeLength, " ans ")

//définir le max et le min de population dans un pays en 2021
let maxPop = 0
let minPop = 0
population.forEach(pays => {
    if (pays[2021] > maxPop) {
        maxPop = pays[2021]
    }
    if (population[0] == pays) {
        minPop = pays[2021]
    } else if (pays[2021] < minPop) {
        minPop = pays[2021]
    }
})
console.log("Le plus grand nombre de personne réunit dans un pays en 2021 est de :", maxPop, "personnes")
console.log("Le plus petit nombre de personne réunit dans un pays en 2021 est de :", minPop, "personnes")

//------------------------------------------------------------------------------

//définir l'échelle de l'axe x
let x = d3.scaleSqrt()
    .domain([0, maxPib * 1.05])
    //la plage est définie comme étendue minimale et maximale des bandes
    .range([0, width])
    .nice()

//définir l'échelle pour l'axe y
let y = d3.scalePow()
    .exponent(1.7)
    .domain([0, maxLifeLength * 1.05])
    //inverser le sens pour avoir la graduation dans le bon sens pour utilisateur 
    .range([height, 0])
    .nice()

//Ajout d'une fonction échelle pour la taille des cercles
let sqrtScale = d3.scaleSqrt()
    .domain([minPop, maxPop])
    .range([5, 20]);

//------------------------------------------------------------------------------

//dessiner l'axe X selon l'échelle établie
svg.append("g")
    //translation de l'axe pour le positionner au bon endroit, en l'occurence descendre le graphe de sa taille en y 
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(d3.format('~s')))

//dessiner l'axe y selon l'échelle établie
svg.append("g").call(d3.axisLeft(y)).call(d3.axisLeft(y).tickSize(-width))

//------------------------------------------------------------------------------

//Custom l'apparance des lignes
svg.selectAll(".tick line").attr("stroke", "white").attr("opacity", "0.3")

//ajouter description axe X 
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", wDiv / 2 + margin.left)
    .attr("y", height + margin.top)
    .text("Log du PIB par habitant [CHF]");

//ajouter description axe Y
svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top - height / 2 + 100)
    .text("Espérance de vie")

//---------------------------------------------------------------------------------------------

//Ajouter les cercles
svg.append('g')
    .selectAll("dot")
    //besoin des data pib par habitant
    .data(allpib)
    //renvoie la séléction d'entrée 
    .enter()
    //ajouter un cercle à chaque entrée
    .append("circle")
    //c'est ici que l'emplacement des cercles sur l'axe X est défini
    .attr("cx", function (d) { return x(d[2021]) })
    //définir l'emplacement des cercles sur l'axe y, en ajoutant le dataset de l'espérance de vie
    .data(lifeEsper)
    .join()
    .attr("cy", function (d) { return y(d[2021]) })
    //modifier la taille des cercles selon la population
    .data(population)
    .join()
    .attr("r", function (d) { return sqrtScale(d[2021]) })
    .style("fill", "#FF7A48")
    .attr("opacity", "0.7")
    .attr("stroke", "black")

//---------------------------------------------------------------------------------------------

d3.select("body").append("h3")
    .attr('id', 'separateur')
    .text("Let's give a look of l'espérance de vie sur une map choroplète...")

//---------------------------------------------------------------------------------------------

//Ajout div - marges - svg
d3.select("body").append("Mapdiv")
    .attr("id", "map")

const Mapmargin = { top: 20, right: 20, bottom: 30, left: 50 }
const Mapwidth = 650 - Mapmargin.left - Mapmargin.right
const Mapheight = 500 - Mapmargin.top - Mapmargin.bottom

const Mapsvg = d3.select("#map")
    .append("svg")
    .attr("width", Mapwidth + Mapmargin.left + Mapmargin.right)
    .attr("height", Mapheight + Mapmargin.top + Mapmargin.bottom + 100)
    .append("g")
    .attr("transform", "translate(" + Mapmargin.left + "," + Mapmargin.top + ")")

//---------------------------------------------------------------------------------------------

//Optimisation utilisation des données
let listPays = []
lifeEsper.forEach(pays => {
    //création d'un objet, pour pouvoir modifier index
    let paysD = {}
    paysD[pays['country']] = pays['2021']
    listPays.push(paysD)
})

//---------------------------------------------------------------------------------------------

//Création de la projection, d3.geoPath() est appelé pour générer un Path à partir des coordonnées cartésiennes
let path = d3.geoPath()
//définir le type de projection
let projection = d3.geoMercator()
    //latitude et longitude de la projection
    .center([0, 20])
    //taille de la projection
    .scale(90)
    //centrer
    .translate([Mapwidth / 2, Mapheight / 2])

//---------------------------------------------------------------------------------------------

let data = new Map()
//échelle des couleurs
let thresholdScale = d3.scaleThreshold()
    .domain([50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100])
    .range(d3.schemeOranges[8])

//---------------------------------------------------------------------------------------------

//Dessiner la map, données au format geojson
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (d) {
    Mapsvg.append('g')
        .selectAll('path')
        //stocker les données dans une liste
        .data(d.features)
        .join("path")
        //l'attribut d définit un tracé à dessiner (liste de commande avec lettre et nombre)
        .attr("d", path.projection(projection))
        //récupérer le pays dans la liste généré. Obj:pouvoir sélectionner dans le tab
        .attr("id", function (d) { return d.properties.name; })
        .attr("fill", function (d) {
            let number = 0;
            listPays.forEach(country => {
                if (typeof country[this.id] != "undefined") {
                    //récupérer l'espérance de vie du pays
                    number = country[this.id]
                }
            })
            //utiliser l'échelle de couleur
            return thresholdScale(number);
        })
        .attr("class", function (d) { return "Country" })
        .style("opacity", 1)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
})

//---------------------------------------------------------------------------------------------

//Fonction gestion des hover
let mouseOver = function (d) {
    d3.selectAll(".Country")
    //modification de valeur de l'attribut file de tous les pays
        .transition()
        //temps que prennent les pays pour baisser en opacité
        .duration(200)
        .style("opacity", .5)
    d3.select(this)//le this est le path du pays
        .transition()
        .duration(200)
        .style("opacity", 1)
}

let mouseLeave = function (d) {
    d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", 1)
    d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
}

//---------------------------------------------------------------------------------------------

//fonction pour convertir les string en int
function strToInt(str) {
    //ici, deux types de cas à prendre en compte
    //M, le million ex : 33,3 = 33 300 000
    let number
    let onlyNumber
    if (str.slice(-1) == 'M') {
        //enlever le dernier caractère, ici le M
        onlyNumber = str.substring(0, str.length - 1)
        //convertir la string en nombre
        number = Number(onlyNumber)
        //multiplier le nombre
        number = number * 1000000
    }//K et k, donc mille ex: 33,3K = 33 300
    else if (str.slice(-1) == 'K' || str.slice(-1) == 'k') {
        onlyNumber = str.substring(0, str.length - 1)
        number = Number(onlyNumber)
        number = number * 1000
    }
    return number
}