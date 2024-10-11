import React, {useState} from 'react';
import {Rapper} from '../Rappers';


export const Rappers = props => {
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

        function upClout(artist, topFifty) {
            console.log(artist);
            setArtistNames(
                artistNames.map(artistName => {
                    let clout = artistName.clout;
                    if (artistName.name === artist) {
                        if (topFifty) {
                            clout +=1;
                        } else if (clout > 0) {
                            clout -= 1;
                        }
                    }
                    return {name: artistName.name, clout: clout};
                })
            );
        }
        return ( 
            <React.Fragment>
            <div style={{ display: "flex", flexDirection: "column" }} > 
            {artistNames.map(artistName => {
                return ( 
                        <Rapper 
                        artist={artistName.name}
                        clout={artistName.clout}
                        upClout={upClout}
                        downClout={upClout}
                        key={artistName.id}
                        />
                    );
                })}
            </div> 
         </React.Fragment>      
    );
};
