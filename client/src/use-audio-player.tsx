import { useEffect, useRef } from "react";


const useAudioPlayer = () => {
    const audioContext = useRef<AudioContext>();
    const sourceNode = useRef<AudioBufferSourceNode>();

    useEffect(() => {
        audioContext.current = new AudioContext();
    }, []);


    const playUrl = (url: string, onendedCallback?: () => void) => {
        fetch(url)
            .then((response) => response.arrayBuffer())
            .then((downloadedBuffer) =>
                audioContext.current?.decodeAudioData(downloadedBuffer)
            ).then((decodedBuffer) => {
                /* sourceNode.current = new AudioBufferSourceNode(audioContext.current!, {
                    buffer: decodedBuffer,
                    loop: false,
                }); */
                if (audioContext.current) {
                    let aCtx = audioContext.current;

                    sourceNode.current = aCtx.createBufferSource();
                    if (sourceNode.current && decodedBuffer) {
                        let source = sourceNode.current;
                        source.buffer = decodedBuffer;
                        source.loop = false;

                        let gainNode = aCtx.createGain();
                        gainNode.connect(aCtx.destination);

                        // Connect the nodes together
                        source.connect(gainNode);
                        gainNode.gain.value = 1;
                        source.start(0); // Play the sound now

                        source.onended = () => {
                            if (onendedCallback)
                                onendedCallback();
                        }
                    }
                }
            }).catch(e => {
                console.error(`Error: ${e}`);
            })
    }

    const stopPlaying = () => {
        sourceNode.current?.stop();
    }

    return { playUrl, stopPlaying }
}

export default useAudioPlayer;