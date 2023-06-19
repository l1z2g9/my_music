import { useState, useRef } from "react";

type Track = {
    url: string;
    title: string;
}

type AudioTrackProp = {
    list?: string[][];
}

export const AudioTrack: React.FC<AudioTrackProp> = (props) => {
    const localserver = "/api/id/";

    let [track, setTrack] = useState<Track>();

    const audioRef = useRef<HTMLAudioElement>(null);

    const play = (e: React.MouseEvent<HTMLButtonElement>) => {
        audioRef.current?.pause();

        let button: HTMLButtonElement = e.currentTarget;
        let id: string = button.value;

        let url = `${localserver}${id}`;
        if (id.startsWith("http")) {
            url = id;
        }

        let title = button.dataset.title!;

        setTrack({ url, title });

        audioRef.current?.play().catch(e => {
            console.error(e);
        });
    }

    const playEnd = () => {
        if (props.list) {
            let track = Math.floor((Math.random() * props.list.length) + 1);
            let id = props.list[track][0];
            let url = `${localserver}${id}`;
            let title = props.list[track][1];

            setTrack({ url, title });
        }
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
                        props.list?.map((list, i) => {
                            return <tr className={i % 2 === 0 ? 'pure-table-odd' : ''} key={list[0]}>
                                <td>
                                    {list[1]}
                                </td>
                                <td><button type="button" className="pure-button pure-button-primary" data-title={list[1]} onClick={play} value={list[0]}>Play</button></td>
                            </tr>
                        })
                    }
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="bg-info">
                            <b>{track?.title}</b>
                        </td>
                    </tr>
                </tfoot>
            </table>
            <div>
                <audio controls src={track?.url} autoPlay onEnded={playEnd} ref={audioRef}></audio>
            </div>
        </div >
    );
}