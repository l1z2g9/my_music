import { useEffect, useRef, useState } from "react";
import { Track } from "./App";
import rPlayer from "./rplayer";

// Reference
// https://rplayer.js.org/
// https://webaudioapi.com/samples/
// https://github.com/mdn/webaudio-examples


type AudioTrackProp = {
    list?: Track[];
}

export const AudioTrack: React.FC<AudioTrackProp> = (props) => {
    const localserver = "/api/id/";

    const [track, setTrack] = useState<Track>();
    const [isStop, setStop] = useState(true);
    const [playRandom, setPlayRandom] = useState(true);

    const audio = useRef<rPlayer>();

    const playAnother = () => {
        if (props.list) {
            let track = Math.floor((Math.random() * props.list.length) + 1);

            console.log("Play another track.", track);

            let id = props.list[track].id;
            let url = `${localserver}${id}`;
            let title = props.list[track].name;

            audio.current?.playSrc(url);

            setTrack({ name: title, id });

            setStop(false);
        }
    }

    useEffect(() => {
        audio.current = new rPlayer();

        /* audio.current.ontimeupdate = function () {
            console.log('Time:', audio.current?.currentTime);
        }; */
    }, []);

    useEffect(() => {
        console.log("check playing", playRandom, audio.current?.playing)
        if (playRandom && !audio.current?.playing) {
            // playAnother();
        }
    }, [playRandom, audio.current?.playing])


    const stop = () => {
        if (track) {
            setStop(true);
            audio.current?.stop();

            setPlayRandom(false);
        }
    }

    const play = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button: HTMLButtonElement = e.currentTarget;
        const id: string = button.value;

        const title = button.dataset.title!;

        console.log("id", id);
        console.log("title", title);

        if (title.startsWith("RTHK") || title.startsWith("FM")) {
            audio.current?.playSrc(id);

            console.log("live radio - Playing", id);
        } else {
            let url = `${localserver}${id}`;

            audio.current?.playSrc(url);

            console.log("ycanList - Playing", url);
            setPlayRandom(true);
        }

        setTrack({ name: title, id });

        setStop(false);
        /*fetch(url)
            .then((response) => response.arrayBuffer())
            .then((downloadedBuffer) =>
                audioContext.current?.decodeAudioData(downloadedBuffer)
            ).then((decodedBuffer) => {
                sourceNode.current = new AudioBufferSourceNode(audioContext.current!, {
                    buffer: decodedBuffer,
                    loop: true,
                });
                // Connect the nodes together
                sourceNode.current.connect(audioContext.current!.destination);
                sourceNode.current.start(0); // Play the sound now

                setStop(false);
            }).catch(e => {
                console.error(`Error: ${e}`);
            });*/


    }

    return (
        <div>
            <table className="pure-table">
                <thead>
                    <tr className="bg-info">
                        <td>Soundtrack</td>
                        <td>Play</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.list?.map((t, i) => {
                            return <tr className={i % 2 === 0 ? 'pure-table-odd' : ''} key={t.id}>
                                <td>
                                    {t.name}
                                </td>
                                <td><button type="button" className="pure-button pure-button-primary" data-title={t.name} onClick={play} value={t.id}>Play</button></td>
                            </tr>
                        })
                    }
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="bg-info">
                            <b>{track && `Playing ${track.name}`}</b>
                        </td>
                    </tr>
                </tfoot>
            </table>
            <div>
                {/* <audio controls src={track?.url} autoPlay onEnded={playEnd} ref={audioRef} ></audio> */}

                {/* <input type="button" value="Start" onClick={start} /> &nbsp; &nbsp; */}
                <input type="button" value="Stop" onClick={stop} disabled={isStop} />
            </div>
        </div >
    );
}