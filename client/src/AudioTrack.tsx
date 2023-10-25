import { useEffect, useRef, useState } from "react";
import { Track } from "./App";
import rPlayer from "./rplayer";
import useAudioPlayer from "./use-audio-player";

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
    const autoPlay = useRef(false);

    const audio = useRef<rPlayer>();
    const { playUrl, stopPlaying } = useAudioPlayer();

    useEffect(() => {
        audio.current = new rPlayer();

        /* audio.current.ontimeupdate = function () {
            console.log('Time:', audio.current?.currentTime);
        }; */
    }, []);


    const stop = () => {
        setStop(true);

        autoPlay.current = false;
        stopPlaying();
        audio.current?.stop();
    }

    const play = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button: HTMLButtonElement = e.currentTarget;
        const id: string = button.value;
        const title = button.dataset.title!;

        console.log("id", id);
        console.log("title", title);

        if (track?.id == id) {
            console.log(id, "is playing");
            return;
        }

        stop();

        if (title.startsWith("RTHK") || title.startsWith("FM")) {
            audio.current?.playSrc(id);

            console.log("live radio - Playing", id);
        } else {
            let url = `${localserver}${id}`;

            // does not work in android chrome 
            // audio.current?.playSrc(url); 
            playUrl(url, playAnother);
            console.log("ycanList - Playing", url);
        }

        setTrack({ name: title, id });

        setStop(false);
    }


    const playAnother = () => {
        if (props.list && autoPlay.current) {
            let track = Math.floor((Math.random() * props.list.length) + 1);

            console.log("Play another track.", track);

            let id = props.list[track].id;
            let url = `${localserver}${id}`;
            let title = props.list[track].name;

            playUrl(url);

            setTrack({ name: title, id });
            setStop(false);
        }
    }

    const styles = {
        buttonWarning: {
            background: "#df7514"
            /* this is an orange */
        }
    };

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

                <button type="button" className="pure-button" style={styles.buttonWarning} onClick={stop} disabled={isStop} >Stop</button>
            </div>
        </div >
    );
}