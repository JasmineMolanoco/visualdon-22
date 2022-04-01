import * as d3 from 'd3';
//importer le fetch depuis la librairie d3
import { json } from 'd3-fetch'

//méthode promise permet d'attendre toutes les réponses
Promise.all([
        //url de l'api (adresse du site + nom du dataset +év numéro de ligne)
        json('https://jsonplaceholder.typicode.com/posts/'),
        json('https://jsonplaceholder.typicode.com/users/')
    ])
    //posts et users correspondent aux réponses obtenues des ressources
    .then(([posts, users]) =>  {
                
        let allUsers = []

        for (let i = 0; i < users.length; i++) {
            let user = {}
            user["nom_utilisateur"] = users[i].username
            user["ville"] = users[i].address.city
            user["nom_companie"] = users[i].company.name        
            
            let postsUser = []
            posts.forEach(post => {
                if(post.userId == users[i].id){
                    postsUser.push(post.title)
                }
            });
    
            user["titres_posts"] = postsUser
            allUsers.push(user)
        }

        //préparation des balises html dans lesquels il y aura le texte "utilisateurs avec leur nombre de post" 
        d3.select('body')
                .append('div')
                .attr('id', `div-user`)
        //stocker le nombre de post par utilisateur
        for (let i = 0; i < allUsers.length; i++) {
                let nbPost = allUsers[i].titres_posts.length
                //afficher dans le DOM 
                d3.select(`#div-user`)
                        .append('div')
                        .attr('id',users[i].id)
                        .append('p')
                        .text(`${allUsers[i].nom_utilisateur} a écrit ${nbPost} posts`)
        }

        //préparation des balises html dans lesquels il y aura le texte "l'utilisateur qui a écrit le post le plus long" 
        d3.select("body")
                .append("div")
                .attr('id', 'div-user-longerPost')

        //définir le nombre de caractère du post le plus long
        let postMax = 0
        for (let i = 0; i < posts.length; i++) {
            let nbCaraPost = posts[i].body.length
            if( nbCaraPost >= postMax){
                postMax = nbCaraPost
            }
        }
        //définir l'utilisateur qui a écrit le post le plus long
        posts.forEach(post => {
            if(post.body.length == postMax){
                let idUser = post.userId - 1
                let userNameMaxPost = users[idUser].username
                let txtMaxPost = post.body
                //afficher ces infos dans le DOM 
                d3.select('#div-user-longerPost')
                        .append('p')
                        .text(`${userNameMaxPost} a écrit le post le plus long, ce Baudelaire du web a écrit : ${txtMaxPost} qui contient ${postMax} caractères`)
            } 
        });

        //dessiner avec les données
        const width = 1000
        const height = 450
        const margin = { top: 50, bottom: 50, left: 50, right: 0 }


        d3.select("body")
            .append("div")
            .attr('id', 'graph-users-post')
        
        let svg = d3.select("#graph-users-post")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        //définir l'échelle (la taille) pour l'axe x
        let x = d3.scaleBand()
            //définit le nombre de colonne dans le graphe, utilisation d'une fonction anonyme
            //d est utilisé pour définir la donnée courante, ici cela pointe vers allUsers
            .domain(allUsers.map(function (d) { return d["nom_utilisateur"] })) //création d'une map qui contient le nom de tous les utilisateurs
            //définit le début et la fin de l'intervalle dans lequel les éléments du domaine seront positionnés 
            .range([0, 1000])
        //définir l'échelle pour l'axe y
        let y = d3.scaleLinear()
            .domain([0, 10])
            //inverser le sens pour avoir la graduation dans le bon sens pour utilisateur 
            .range([height, 0])

        //ajouter l'axe y au svg, grâce à une fonction
        svg.append("g").call(d3.axisLeft(y))

        svg.append("g")
            //translation de l'axe pour le positionner au bon endroit, en l'occurence descendre le graphe de sa taille en y 
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            //augmenter la lisibilité des textes en modifiant leur position
            .selectAll("text")
            .attr("transform", "translate(-2,10)")

        //génération des rectangles en les ajoutant au svg 
        //sélection de tous les rectangles, qui n'existent pas -> obtention d'une sélection vide
        svg.selectAll("rect")
            .data(allUsers)//sélection du dataset
            .enter()//est appelé le même nombre de fois que le nombre de ligne dans le dataset, puis renvoie une sélection d'espace reservé pour chaque point qui n'a pas encore de rectangle (donc tous)
            .append("rect")//applique ainsi un rectanlge dans le DOM  à chaque ligne du dataset qui n'a pas de rect 
            //compléter les attributs nécessaire au rectangle en svg
            .attr("x", function (d) { return x(d["nom_utilisateur"]) + 30 })
            .attr("y", function (d) { return y(d["titres_posts"].length)})
            .attr("width", "40px")
            .attr("height", function (d) { return height - y(d["titres_posts"].length) })
            //juste une couleur hexadécimal random
            .attr("fill", `#${Math.floor(Math.random()*16777215).toString(16)}`)
  });