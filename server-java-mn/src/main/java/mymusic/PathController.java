package mymusic;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.lang.reflect.Array;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.io.ResourceLoader;
import io.micronaut.core.util.StringUtils;
import io.micronaut.http.HttpHeaders;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.PathVariable;

@Controller("/api")
public class PathController {
    private Logger logger = System.getLogger(PathController.class.getName());

    @Inject
    private ResourceLoader loader;

    private Map<String, String> config = new HashMap<>();
    private Map<String, List<AudioCateogry>> audioCategory = new HashMap<>();

    @Introspected
    static class AudioCateogry {
        private String name;
        private String id;

        public AudioCateogry(String name, String id) {
            this.name = name;
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public String getId() {
            return id;
        }
    }

    @PostConstruct
    private void init() {
        Arrays.asList("ycanList", "rthkList").forEach(f -> {
            try {
                logger.log(Level.INFO, "f = " + f);
                readTrackList(f);
            } catch (IOException e) {
                logger.log(Level.ERROR, e);
            }
        });
    }

    private void readTrackList(String fileName) throws IOException {
        logger.log(Level.INFO, "file name = " + fileName);
        try (InputStream in = loader.getResourceAsStream(fileName + ".txt").orElseThrow()) {
            List<String> lines = new BufferedReader(new InputStreamReader(in,
                    StandardCharsets.UTF_8)).lines().collect(Collectors.toList());

            lines.forEach(line -> {
                String[] p = line.split("\\|");
                if (p.length > 1) {
                    if (p.length > 2) {
                        config.put(p[1], p[2]);
                    }

                    AudioCateogry ac = new AudioCateogry(p[0], p[1]);
                    if (audioCategory.containsKey(fileName)) {
                        audioCategory.get(fileName).add(ac);
                    } else {
                        List<AudioCateogry> list = new ArrayList<>();
                        list.add(ac);
                        audioCategory.put(fileName, list);
                    }
                }
            });
        }
    }

    @Get("/id/{id}")
    public void getGoogleDriveLink(HttpServletResponse response, @PathVariable String id) throws IOException {
        logger.log(Level.INFO, "Google Drive link id ===== " + id);
        String secret = config.get(id);

        if (StringUtils.isNotEmpty(secret)) {
            String link = String.format("https://drive.google.com/uc?id=%s&export=download&resourcekey=%s", id, secret);
            logger.log(Level.INFO, "link = " + link);

            response.addHeader(HttpHeaders.CONTENT_TYPE, "audio/mpeg3;audio/x-mpeg-3;video/mpeg;video/x-mpeg;text/xml");
            response.setStatus(HttpStatus.ACCEPTED.getCode());

            try (InputStream in = new URL(link).openStream()) {
                in.transferTo(response.getOutputStream());

                /*
                 * ReadableByteChannel inChannel = Channels.newChannel(in);
                 * final WritableByteChannel outChannel =
                 * Channels.newChannel(response.getOutputStream());
                 * ByteBuffer buffer = ByteBuffer.allocate(8192);
                 * while (inChannel.read(buffer) > 0) {
                 * buffer.flip();
                 * outChannel.write(buffer);
                 * buffer.rewind();
                 * }
                 * 
                 * inChannel.close();
                 * outChannel.close();
                 */
            }
        } else {
            response.getWriter().write("Link not found");
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    @Get("/category/{category}")
    public List<AudioCateogry> getAudioList(@PathVariable String category) {
        return audioCategory.get(category);
    }
}
