import { useEffect, useState } from 'react';

import cardBack from '../assets/card-back.png';
import Evolvebar from './Evolvebar';

// TO DO: destructing props
const Player = (props) => {

    const [pokemonUrl, setPokemonUrl] = useState(props.evolutionArr[props.playerEvolution].frontGifUrl);

    const playerCardsProp = props.playerCards

    const currentEvolution = props.evolutionArr[props.playerEvolution];

    // evolution animation 
    useEffect(() => {
        if (props.evolutionArr[props.playerEvolution - 1]?.frontGifUrl !== undefined) {
            setTimeout(() => {
                let intervalId = setInterval(() => {
                    setPokemonUrl((pokemon) =>
                        pokemon === props.evolutionArr[props.playerEvolution].frontGifUrl
                            ? props.evolutionArr[props.playerEvolution - 1].frontGifUrl
                            : props.evolutionArr[props.playerEvolution].frontGifUrl
                    )
                }, 50) // how fast the image toggles

                setTimeout(() => {
                    clearInterval(intervalId);
                    setPokemonUrl(props.evolutionArr[props.playerEvolution].frontGifUrl)
                }, 1100); // evoluting time

                setPokemonUrl(props.evolutionArr[props.playerEvolution].frontGifUrl)
            }, 1000) // delay start of evolution
        }
    }, [props.playerEvolution])


    return (
        <div className="playerSection">

            <div className='pokemonEvolve'>
                {/* Evolve Bar Component */}
                <Evolvebar
                    evolutionArray={props.evolutionArr}
                    evolutionPoint={props.playerEvolution}
                    barType='player'
                />
            </div>

            <div className="pokemonMain">
                <ul className='playerCardList'>
                    {
                        playerCardsProp.map((card) => {
                            return (
                                <li key={card.code} className="cardContainer">
                                    <div className="innerCard">
                                        <figure className='card cardBack'><img src={cardBack} alt="back of poker card" /></figure>
                                        <figure className='card cardFront'><img src={card.image} alt={card.value + card.suit} /></figure>
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
                <div className="playStatus">
                    <p className='playPoint'>{props.cardValue}</p>
                    {
                        props.bustStatus
                            ? <p className="bust">bust</p>
                            : null
                    }
                </div>

                {/* avatar and name */}
                <div className="playStats">
                    <img className='playerPokemon' src={pokemonUrl} alt={currentEvolution.altFront} />
                    <h3>{currentEvolution.name}</h3>
                </div>

            </div>
        </div>
    )
}

export default Player;