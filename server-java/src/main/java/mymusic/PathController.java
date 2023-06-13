package mymusic;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.util.ResourceUtils;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import io.micrometer.common.util.StringUtils;

@RestController
@RequestMapping("/api")
public class PathController {
    private static Logger log = LoggerFactory.getLogger(PathController.class);

    @Autowired
    private HttpServletResponse res;

    private final RestTemplate restTemplate;

    private Map<String, String> config = new HashMap<>();

    @Autowired
    public PathController(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    @PostConstruct
    private void init() throws IOException {
        try (InputStream in = new ClassPathResource("link-config.txt").getInputStream()) {
            List<String> lines = new BufferedReader(new InputStreamReader(in,
                    StandardCharsets.UTF_8)).lines().collect(Collectors.toList());

            lines.forEach(line -> {
                String[] p = line.split("\\|");
                config.put(p[1], p[2]);
            });
        }
    }

    @GetMapping("/id/{id}")
    public void getGoogleDriveLink(@PathVariable String id) throws IOException {
        String secret = config.get(id);

        if (StringUtils.isNotBlank(secret)) {
            String link = String.format("https://drive.google.com/uc?id=%s&export=download&resourcekey=%s", id, secret);
            log.info("link = {}", link);

            restTemplate.execute(
                    link,
                    HttpMethod.GET,
                    clientHttpRequest -> clientHttpRequest.getHeaders()
                            .setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL)),
                    clientHttpResponse -> {
                        StreamUtils.copy(clientHttpResponse.getBody(), res.getOutputStream());
                        return null;
                    });
        } else {
            res.getWriter().write("Link not found");
            res.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }

    }
}