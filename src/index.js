lockDragEventOnImages();

getPokedex();
getPokemonEntries();
updatePokedexData();

async function getPokedex(){

    const cache = await caches.open('cached-data')
    const isCached = await cache.match('/pokedexData.json')

    if(!isCached || !isCached.ok){
        
        const options = {
            method: "GET",
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }
    
        const response = await axios.get('https://pokeapi.co/api/v2/pokedex/kanto');
    
        await cache.put('/pokedexData.json',new Response(JSON.stringify(response.data), options));
    
    }

};

async function getPokemonEntries(){

    const cache = await caches.open('cached-data');
    const isCached = await caches.match('/pokemonData.json');

    if(!isCached || !isCached.ok){
        const pokedexData = await cache.match('/pokedexData.json').then(cache => cache.json());
        
        const pokemonDataArr = [];

        for(let pokemon of pokedexData.pokemon_entries){
            
            const pokemonName = pokemon.pokemon_species.name;

            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)

            pokemonDataArr.push(response.data)
        };

        const options = {
            method: "GET",
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        };
    
        await cache.put('/pokemonData.json', new Response(JSON.stringify(pokemonDataArr), options));
    
    }
};

async function getPokemonData(pokemonId){
    const cache = await caches.open('cached-data');
    const pokemonData = await caches.match('/pokemonData.json').then(cachedData=> cachedData.json());

    return pokemonData.filter(pokemon=>pokemon.id===pokemonId)[0]
};

async function updatePokedexData(){
    const cache = await caches.open('cached-data');
    const pokemonData = await cache.match('/pokemonData.json').then(cache=>cache.json());

    const root = `
    <tr>
        <td></td>
        <td></td>
        <td class="pokemon-cell">
            <div>
                <img src="">
            </div>
            <div>
                <span></span>
            </div>
        </td>
        <td>
        </td>
    </tr>
    `;

    const tbody = document.querySelector('tbody')

    for(let pokemon of pokemonData){

        const {types} = pokemon

        const typeNames = []

        for(let type of types){
            typeNames.push(type.type.name)
        }

        const spanCollection = new DocumentFragment()

        for(let i = 0; i < typeNames.length; i++){
            const span = document.createElement('span')
            const br = document.createElement('br')

            span.innerText = typeNames[i]

            checkPokemonType(span)

            spanCollection.append(span)

            if( (i+1) !== typeNames.length){
                spanCollection.append(br)
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = root;
        
        const td = tr.querySelectorAll('td');

        td[0].innerText = checkKdexNumber(pokemon.id);
        td[1].innerText = checkNdexNumber(pokemon.id);
        td[2].children[0].querySelector('img').setAttribute('src', `${pokemon.sprites.front_default}`) 
        td[2].children[1].querySelector('span').innerText = pokemon.name
        
        td[3].append(spanCollection)

        tr.pokemonId = pokemon.id

        tbody.append(tr)
    }

    addEventListenersOnElements();

};

function checkPokemonType(span){
    const typeName = span.innerText

    if(typeName === 'grass'){
        span.classList.add('grassSpan')
    } else if(typeName === 'poison'){
        span.classList.add('poisonSpan')
    } else if(typeName === 'fire'){
        span.classList.add('fireSpan')
    } else if(typeName === 'flying'){
        span.classList.add('flyingSpan')
    } else if(typeName === 'water'){
        span.classList.add('waterSpan')
    } else if(typeName === 'bug'){
        span.classList.add('bugSpan')
    } else if(typeName === 'normal'){
        span.classList.add('normalSpan')
    } else if(typeName === 'electric'){
        span.classList.add('electricSpan')
    } else if(typeName === 'ground'){
        span.classList.add('groundSpan')
    } else if(typeName === 'fairy'){
        span.classList.add('fairySpan')
    } else if(typeName === 'fighting'){
        span.classList.add('fightingSpan')
    } else if(typeName === 'psychic'){
        span.classList.add('psychicSpan')
    } else if(typeName === 'rock'){
        span.classList.add('rockSpan')
    } else if(typeName === 'steel'){
        span.classList.add('steelSpan')
    } else if(typeName === 'ice'){
        span.classList.add('iceSpan')
    } else if(typeName === 'ghost'){
        span.classList.add('ghostSpan')
    } else if(typeName === 'dragon'){
        span.classList.add('dragonSpan')
    }
 
};

function checkKdexNumber(num){
    if(num < 10){
        return `#00${num}`
    } else if(num < 100){
        return `#0${num}`
    } else{
        return `#${num}`
    }
};

function checkNdexNumber(num){
    if(num < 10){
        return `#000${num}`
    } else if(num < 100){
        return `#00${num}`
    } else{
        return `#0${num}`
    }
};

function addEventListenersOnElements(){
    const currentPokemon = document.querySelector('#current-pokemon')
    const exitButton = currentPokemon.querySelector('span')
    const pokedexContent = document.querySelector('.screen-content')
    const pokemonEntries =  pokedexContent.querySelectorAll('tbody tr')

    pokemonEntries.forEach(entryElement =>{
        entryElement.addEventListener('click', updateSelectedPokemonScreen)
    })

    exitButton.addEventListener('click', ()=>{
        pokedexContent.hidden = false
        currentPokemon.hidden = true
    })

};

async function updateSelectedPokemonScreen(e){
    const currentPokemon = document.querySelector('#current-pokemon');
    const pokedexContent = document.querySelector('.screen-content');
    const pokemonEntry = e.target.closest('tr')
    const pokemonTypes = pokemonEntry.querySelectorAll('td')[3].innerHTML.replace('<br>', ', ')
    const pokemonId = pokemonEntry.pokemonId;

    const selectedPokemonData = await getPokemonData(pokemonId).then(res=>res); 

    pokedexContent.hidden = true
    currentPokemon.hidden = false

    console.log(selectedPokemonData)

    updateScreenElements(
        currentPokemon, 
        selectedPokemonData.sprites.front_default,
        selectedPokemonData.name,
        pokemonTypes,
        selectedPokemonData.stats
        )
};

function updateScreenElements(currentPokemon, spriteSRC, pokemonName, pokemonTypes, pokemonStats){
    let statsString = '';

    const leftPanelHTML = `
    <aside>
        <img src="${spriteSRC}" draggable='false'>
    </aside>
    <aside>
        <h1>${pokemonName}</h1>
        <h4>type: ${pokemonTypes} </h4>
    </aside>`;



    for(let stat of pokemonStats){
        console.log(stat)

        statsString += `<li>${stat.stat.name}: ${stat.base_stat} | EV: ${stat.effort}</li>`    
    };

    const rightPanelHTML = `
    <aside>
        <h2>Base Stats</h2>
        <ul>
            ${statsString}
        </ul>
    </aside>`;

    currentPokemon.querySelector('.left-panel').innerHTML = leftPanelHTML;
    currentPokemon.querySelector('.right-panel').innerHTML = rightPanelHTML;
};

function lockDragEventOnImages(){
    let images = document.getElementsByTagName('img');

    for(let image of images){
        image.setAttribute("draggable", false);

        image.addEventListener('dragstart', e=>{
            e.preventDefault()
        }, false)
    }
};
