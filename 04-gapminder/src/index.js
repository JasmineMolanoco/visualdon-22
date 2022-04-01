import * as d3 from 'd3';
import { json } from 'd3-fetch'

// PIB par habitant par pays et pour chaque année depuis 1800
import gdp from '../data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv' //PIB par habitant par pays et pour chaque année depuis 1800

// Espérance de vie par pays et pour chaque année depuis 1800
import lifeExpectancy from '../data/life_expectancy_years.csv' //espérance de vie par pays et pour chaque année depuis 1800

// Population depuis 1800
import population from '../data/population_total.csv' //population depuis 1800 par pays

// Population de 2021
population.forEach(pays => { //on cherche d'abord à créer un tableau objet "pays" dans lequel on va ajouter tous les noms de pays
    (Object.keys(pays)).forEach(key => {
        if (typeof pays[key] == 'string' && key !== 'country') { //ici on veut tout les éléments du csv qui est une chaine de caractères (les chiffres) sauf la colonne country (donc les noms des pays)
            pays[key] = strToInt(pays[key])
        }
    })
    // console.log(pays['2017']); //pour vérifier: ca affiche toutes les populations de 2017
})

// PIB de 2021
let nbPib
gdp.forEach(pays => {
    if (typeof pays[2021] == 'string') {
        nbPib = strToInt(pays[2021])
        pays[2021] = nbPib
    }

    console.log(nbPib);
})

// Data les plus récentes pour les pays qui n'ont pas d'info en 2021
lifeExpectancy.forEach(pays => {
    if (pays[2021] == null) {
        let i = 2021
        do {
            i--
        } while (pays[i] == null);
        pays[2021] = pays[i]
    }
})


/* GRAPH -------------------------------------------------------------------------------- */
// Ajouter une div qui contiendra le graph
d3.select("body")
    .append("div")
    .attr('id', 'graph')
    .attr('width', '90%')

let widthDiv = document.querySelector('#graph').offsetWidth;

// set les marges
const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = widthDiv - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom

// Créer le svg du graph
const svg = d3.select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 200)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// Couleur de fond
svg.append("rect")
    // Position héritée -> pas besoin d'être modifiée
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width)
    .style("fill", "lightblue")


/* AXES -------------------------------------------------------------------------------- */
// Dimensions de l'axe X de 0 au PIB le plus grand
let maxPib = 0
gdp.forEach(pibByYear => {
    if (pibByYear[2021] > maxPib) {
        maxPib = pibByYear[2021]
    }
})

// Dimensions de l'axe Y 0 à l'esperence de vie la plus grande
let maxLifeLength = 0
lifeExpectancy.forEach(lifeExpectancyByYear => {
    if (lifeExpectancyByYear[2021] > maxLifeLength) {
        maxLifeLength = lifeExpectancyByYear[2021]
    }
})

// Max et le min de population dans un pays en 2021
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

// Echelle de l'axe X
let x = d3.scalePow()
    .exponent(0.6)
    .domain([0, maxPib * 1.05])
    // la plage est définie comme étendue minimale et maximale des bandes
    .range([0, width])
    .nice()

// Echelle pour l'axe Y 8ordre de grandeur9
let y = d3.scalePow()
    // agrandit exponotiellement l'echelle pour mettre en valeur l'endroit ou il y a le plus de données
    .exponent(1.7)
    .domain([0, maxLifeLength * 1.05])
    // inverser le sens pour avoir la graduation dans le bon sens pour utilisateur 
    .range([height, 0])
    .nice()

// Fonction échelle pour la taille des cercles
let sqrtScale = d3.scaleSqrt()
    .domain([minPop, maxPop])
    .range([4, 30]);




/* DESSINER LES AXES -------------------------------------------------------------------------------- */
// Axe X
svg.append("g")
    //translation de l'axe pour le positionner au bon endroit, en l'occurence descendre le graphe de sa taille en y 
    .attr("transform", "translate(0," + height + ")")
    // direction des traits de l'axe (vers l'intérieur)
    .call(d3.axisBottom(x))
    .call(d3.axisBottom(x).tickSize(-height * 1.3).ticks(10))

// Axe Y
svg.append("g")
    .call(d3.axisLeft(y))
    .call(d3.axisLeft(y)
        .tickSize(-width * 1.5)
        .ticks(10))


/* APPARENCE ------------------------------------------------------------------------------------------ */
// Lignes
svg.selectAll(".tick line")
    .attr("stroke", "white")
    .attr("opacity", "0.6")

// Description axe X 
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 5)
    .text("PIB par habitant [CHF]");

// Description axe Y
svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top - height / 2 + 20)
    .text("Espérance de vie")


/* CERCLES ------------------------------------------------------------------------------------------- */
// Ajout de cercles
svg.append('g')
    //selectionné un conteneur inexistant qui vas contenir nos cercle
    .selectAll("dot")  
    // lui insérer data pib par habitant
    .data(gdp)
    // renvoie la séléction d'entrée 
    .enter()
    // ajout d'un cercle à chaque entrée
    .append("circle")
    // Définir l'emplacement des cercles sur l'axe X 
    .attr("cx", function (d) { return x(d[2021]) })
    // Définir l'emplacement des cercles sur l'axe Y en ajoutant le dataset de l'espérance de vie
    .data(lifeExpectancy)
    .join()
    .attr("cy", function (d) { return y(d[2021]) })
    // Modifie la taille des cercles selon la population
    .data(population)
    .join()
    .attr("r", function (d) { return sqrtScale(d[2021]) })
    .style("fill", "purple")
    .attr("opacity", "0.4")
    .attr("stroke", "white")
//---------------------------------------------------------------------------------------------

//fonction pour convertir les string en int ainsi que les k en milliers et les m en millions
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