import { useEffect, useRef, useState } from "react";
import { Track } from "./App";


type AudioTrackProp = {
    list?: Track[];
}

export const AudioTrack: React.FC<AudioTrackProp> = (props) => {
    const localserver = "/api/id/";

    const [track, setTrack] = useState<Track>();

    const [isStop, setStop] = useState(true);

    const audioContext = useRef<AudioContext>();
    const sourceNode = useRef<AudioBufferSourceNode>();

    useEffect(() => {
        audioContext.current = new AudioContext();
    }, []);


    const stop = () => {
        if (track) {
            setStop(true);
            sourceNode.current?.stop(0);
        }
    }

    const play = (e: React.MouseEvent<HTMLButtonElement>) => {
        sourceNode.current?.stop(0);

        const button: HTMLButtonElement = e.currentTarget;
        const id: string = button.value;

        let url = `${localserver}${id}`;

        const title = button.dataset.title!;

        if (id.startsWith("RTHK")) {
            window.open(title);
            return;
        }

        setTrack({ name: title, id });

        fetch(url)
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
            });
    }

    /* const playEnd = () => {
        if (props.list) {
            let track = Math.floor((Math.random() * props.list.length) + 1);
            let id = props.list[track].id;
            let url = `${localserver}${id}`;
            let title = props.list[track].name;

            setTrack({ name: title, id });
        }
    } */

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
                            <b>{track?.name}</b>
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