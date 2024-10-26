import React, {useState, useEffect} from 'react';
import {RapperCloutButton} from '../RapperCloutButton';


const Rappers = props => {
        const [artistNames, setArtistNames] = useState([
            {
                id: 1,
                name: 'Jay-Z',
                clout: 0,
            },
            {
                id: 2,
                name: 'Drake',
                clout: 0,
            },
            {
                id: 3,
                name: 'J Cole',
                clout: 0,
            },
            {
                id: 4,
                name: 'Kendrik Lamar',
                clout: 0,
            },
            {
                id: 5,
                name: 'Young Thug',
                clout: 0,
            },
            {
                id: 6,
                name: 'Pusha T',
                clout: 0,
            },
            {
                id: 7,
                name: 'Cardi B',
                clout: 0,
            },
            {
                id: 8,
                name: 'Kanye West',
                clout: 0,
            },
            {
                id: 9,
                name: 'ScHoolboyQ',
                clout: 0
            }
        ]);

        function upClout(artist, topFifty, clout, id) {
            console.log(artist);
            // console.log(...artistNames)
            // console.log(topFifty);
            console.log(this.clout)
            // console.log(this.id)
            setArtistNames(
                artistNames.map((artistName, id) => {
                    let clout = artistName.clout;
                    if (artistName.name === artist) {
                        if ( topFifty ) {
                            clout++;
                        } else if (clout > 0) {
                            clout --;
                        }
                    }
                    return {name: artistName.name, clout: clout};
                })
            );
        }
    
    useEffect(() => {
        
    })
        return ( 
            <React.Fragment>
            <div style={{ display: "flex", flexDirection: "column", color: "green" }} > 
            {artistNames.map((artistName, id) => {
                return ( 
                        <RapperCloutButton 
                        key={id}
                        artist={artistName.name}
                        clout={artistName.clout}
                        upClout={upClout}
                        downClout={upClout}
                        />
                    );
                })}
            </div> 
         </React.Fragment>      
    );
};

export default Rappers;