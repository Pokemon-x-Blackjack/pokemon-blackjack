import axios from "axios"
import { useState, useEffect } from "react"
import Game from "./Game"
import ErrorPage from "./Error404"
import pikaLoading from "../assets/loadingScreen/pikachu-running.gif"
import CharacterCard from "./CharacterCard"



const CharacterSelector = ({ setButtonSelected }) => {

    // *********** USESTATES ***************

    // pokemon data from starting roster
    const [rosterArr, setRosterArr] = useState([]);

    //  evolution data for selected pokemon
    const [evolutionArr, setEvolutionArr] = useState([]);
    const [dealerEvolutionArr, setDealerEvolutionArr] = useState([]);


    // loading screen
    const [isLoading, setIsLoading] = useState(false)
    // Api Error message
    const [apiError, setApiError] = useState('')


    // true when below state conditions are met  
    const [formSubmit, setFormSubmit] = useState(false)

    // true when evolutionArr is populated
    const [evolveReady, setEvolveReady] = useState(false)

    // onClick, updates to selected pokemon name
    const [userPokemon, setUserPokemon] = useState('')


    // starter pokemon 
    const rosterList = ['pichu', 'charmander', 'squirtle', 'bulbasaur', 'poliwag', 'chikorita', 'torchic', 'nidoran-m']




    // *********** FUNCTIONS: API CALLS ***************

    // API calls a pokemon, returns promise
    const apiCallPokemon = (idOrName) => {

        // dynamic link
        const pokeInfoUrl = new URL(`https://pokeapi.co/api/v2/pokemon/${idOrName}`)

        // storing axios request in variable
        const pokemonRequest = axios.get(pokeInfoUrl)
            .catch((error) => {
                if (error.response) {
                    const errorStatus = `Having trouble finding pokemon: ${error.response.statusText}`;
                    setApiError(errorStatus)
                }
            });

        return pokemonRequest;
    }

    // call to evolution chain via species endpoint, returns evolution arr via promise 
    const apiCallEvolution = (name) => {
        // access species data via pokemon name
        const speciesUrl = new URL(`https://pokeapi.co/api/v2/pokemon-species/${name}/`)

        const speciesCall = axios.get(speciesUrl)
            .then((speciesRes) => {
                // in species data, access evolution url
                const evolutionUrl = speciesRes.data.evolution_chain.url

                const evolutionCall = axios.get(evolutionUrl)
                    .then((evolveRes) => {
                        const dataPath = evolveRes.data.chain
                        // call evolution url, access to each evolution
                        const firstEvol = dataPath.species.name
                        const secondEvol = dataPath.evolves_to[0].species.name
                        const thirdEvol = dataPath.evolves_to[0].evolves_to[0].species.name

                        return [firstEvol, secondEvol, thirdEvol]
                    })
                return evolutionCall
            })
            .catch((error) => {
                if (error.response) {
                    const errorStatus = error.response.statusText;
                    setApiError(`Having trouble finding evolutions for ${name}: ${errorStatus}`)
                }
            })
        return speciesCall
    }


    // *********** FUNCTIONS: CREATE OBJS FROM RESPONSE ***************


    // creates direct path to data, makes obj, push to specified arr

    const createPokeObj = (resObj, arr) => {
        if (resObj !== undefined) {
            // datapath 
            const pokemonInfo = resObj.data

            // creating obj 
            const infoObj = {
                name: pokemonInfo.name,
                id: pokemonInfo.id,
                frontGifUrl: pokemonInfo.sprites.versions["generation-v"]['black-white'].animated['front_default'],
                backGifUrl: pokemonInfo.sprites.versions["generation-v"]['black-white'].animated['back_default'],
                evolutionThumb: pokemonInfo.sprites.versions["generation-v"]['black-white'].front_default,
                altFront: `${pokemonInfo.name} in an idle stance.`,
                altBack: `${pokemonInfo.name} facing towards the action in an idle stance.`
            }

            // push to specified arr
            arr.push(infoObj)
        }
    }

    // takes apiCallEvolution response (arr), makes apicall/evolution, createPokeObj/evolution, stored in evolution state
    const evolutionChainToObj = (evolutionRes, setState) => {
        if (evolutionRes !== undefined) {
            // resolve promise to use apiCallEvolution arr
            evolutionRes.then((evolutionNames) => {

                // empty promise arr
                const evolutionPromises = []

                // making api call to each evolution, pushing promise
                evolutionNames.forEach((pokemonName) => {
                    evolutionPromises.push(apiCallPokemon(pokemonName));
                })

                // ALL promises ready? 
                Promise.all(evolutionPromises)
                    .then((evolutionData) => {
                        // empty temp arr
                        const tempArr = []
                        evolutionData.forEach((pokemon) => {
                            // creating obj per pokemon, saving to tempArr
                            createPokeObj(pokemon, tempArr);
                        })

                        // storing in Evolution Arr
                        setState(tempArr);
                        // API data returns remove loading screen
                        setIsLoading(false);
                    })
            })
        }
    }

    // *********** USE EFFECTS ***************


    // on component render: make api call for rosterList info, store in state
    useEffect(() => {

        // loading page on page load
        setIsLoading(true);

        // empty promise arr
        const starterPromises = []

        // making api calls for each pokemon -  storing promises in promise arr 
        rosterList.forEach((pokemon) => {
            starterPromises.push(apiCallPokemon(pokemon));
        })

        // ALL promises resolved? create specific obj per call, push to tempArr and save arr to state 
        Promise.all(starterPromises)
            .then((starterData) => {
                // EMPTY temp arr, once objs are made, save to 
                const tempArr = []

                // iterating through all starter pokemon
                starterData.forEach((starterObj) => {
                    //creating obj - sending to temp arr
                    createPokeObj(starterObj, tempArr);
                })
                // storing objs in state
                setRosterArr(tempArr);
                setCurrentCard(0);
                setPrevCard(7);
                setNextCard(1);
            })

    }, [])

    // generate dealerArr when userPokemon changes
    useEffect(() => {

        const randomPokemon = (arr) => {
            return Math.floor(Math.random() * arr.length)
        }

        // filter rosterlist, excluding user pokemon 
        const dealerRoster = rosterList.filter((pokemon) => { return pokemon !== userPokemon })

        // randomize a pokemon
        const randomDealer = dealerRoster[randomPokemon(dealerRoster)]

        // fetch evolution arr
        evolutionChainToObj(apiCallEvolution(randomDealer), setDealerEvolutionArr)

        // player can proceed
        setEvolveReady(true)

    }, [userPokemon])


    // *********** FUNCTIONS: EVENT HANDLERS ***************


    // sets user pokemon on clicked pokemon, finds evolutions in background
    const handleClickSelect = (event) => {
        const clickedPokemon = event.target.textContent;

        setUserPokemon(clickedPokemon)
        evolutionChainToObj(apiCallEvolution(clickedPokemon), setEvolutionArr)
    }

    // Accessibility: keyboard only users can select
    const handleFocusSelect = (event) => {
        event.target.addEventListener('keyup', (event) => {
            if (event.keyCode === 13) {
                handleClickSelect(event)
            }
        })
    }


    // character select form submit: 
    const handleCharacterSubmit = (event) => {
        event.preventDefault();

        // checks if pokemon is chosen
        // renders game.js
        if (userPokemon !== '' && evolveReady === true) {
            setFormSubmit(true);
        }
    }



    // carousel slide
    const [currentCard, setCurrentCard] = useState(0);
    const [prevCard, setPrevCard] = useState(7);
    const [nextCard, setNextCard] = useState(1);



    const moveRoster = (direction) => {
        if (direction === 'left') {
            // pokemon moves to left
            setCurrentCard(currentCard === rosterArr.length - 1 ? 0 : currentCard + 1)
            setPrevCard(prevCard === rosterArr.length - 1 ? 0 : prevCard + 1)
            setNextCard(nextCard === rosterArr.length - 1 ? 0 : nextCard + 1)

        } else {
            // pokemon moves right
            setCurrentCard(currentCard === 0 ? rosterArr.length - 1 : currentCard - 1)
            setPrevCard(prevCard === 0 ? rosterArr.length - 1 : prevCard - 1)
            setNextCard(nextCard === 0 ? rosterArr.length - 1 : nextCard - 1)

        }
    }

    return (
        <>
            {
                // checking for Api Errors
                apiError !== '' ? (

                    <ErrorPage
                        apiError={apiError}
                        setButtonSelected={setButtonSelected}
                    />) :

                    // loading state for apiCallPokemon

                    isLoading ? (
                        <div className="loadingPage">
                            <h2>Loading...</h2>
                            <img src={pikaLoading} alt="Pikachu running as the game loads" />
                        </div>
                    ) :
                        // game component renders on 

                        formSubmit === true ? (

                            <Game
                                evolutionArr={evolutionArr}
                                dealerEvolutionArr={dealerEvolutionArr}
                            />) :


                            // character selection component

                            < section className="characterSelect" >
                                {/* wrapper */}
                                <div className="wrapper">


                                    {/* character selection form */}
                                    <form
                                        action="#"
                                        onSubmit={handleCharacterSubmit}
                                        className="characterForm">

                                        <h2>CHOOSE YOUR POKEMON</h2>

                                        <div className="rosterContainer">

                                            {/* list of pokemon to choose from */}
                                            <ul className="pokeRoster" >

                                                {/* previous pokemon */}
                                                <li className="pokemonCardContainer">
                                                    {rosterArr.length > 0 ?
                                                        <CharacterCard
                                                            userPokemon={userPokemon}
                                                            rosterArr={rosterArr}
                                                            cardOrder={prevCard}
                                                            handleClickSelect={handleClickSelect}
                                                            handleFocusSelect={handleFocusSelect}
                                                        />
                                                        : null}
                                                </li>

                                                {/* current pokemon */}
                                                <li className="pokemonCardContainer">
                                                    {rosterArr.length > 0 ?
                                                        <CharacterCard
                                                            userPokemon={userPokemon}
                                                            rosterArr={rosterArr}
                                                            cardOrder={currentCard}
                                                            handleClickSelect={handleClickSelect}
                                                            handleFocusSelect={handleFocusSelect}
                                                        />
                                                        : null}
                                                </li>
                                                {/* next pokemon */}
                                                <li className="pokemonCardContainer">
                                                    {rosterArr.length > 0 ?
                                                        <CharacterCard
                                                            userPokemon={userPokemon}
                                                            rosterArr={rosterArr}
                                                            cardOrder={nextCard}
                                                            handleClickSelect={handleClickSelect}
                                                            handleFocusSelect={handleFocusSelect}
                                                        />
                                                        : null}
                                                </li>

                                            </ul>
                                            <div className="overlay">
                                                <button
                                                    type="button"
                                                    onClick={() => { moveRoster('left') }}
                                                    className="overlayBtn prevOverlay">
                                                    <span className="sr-only">move to previous pokemon</span>
                                                    <i className="fa-solid fa-caret-right"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => { moveRoster('right') }}
                                                    className="overlayBtn nextOverlay">
                                                    <span className="sr-only">move to next pokemon</span>
                                                    <i className="fa-solid fa-caret-right"></i>
                                                </button>

                                            </div>

                                        </div>
                                        {/* submit form */}
                                        <button>All Set!</button>
                                    </form>
                                </div>
                            </section >
            }
        </>

    )

}
export default CharacterSelector;