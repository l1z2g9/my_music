package mymusic;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SetupGoogleDriveLink {
    public void listPath(String filename) throws IOException {
        String currentPath = "C:/Users/user/Desktop/Forrest/workspace/my_music/server-java";

        Path outFile = Paths.get(currentPath, "out.txt");

        Files.writeString(outFile, "", StandardCharsets.UTF_8, StandardOpenOption.TRUNCATE_EXISTING);

        String content = Files.readString(Paths.get(currentPath, filename), StandardCharsets.UTF_8);
        Pattern p = Pattern.compile("\\x22https.+?唐詩.+?\\x22");
        Matcher m = p.matcher(content);

        Pattern p2 = Pattern
                .compile("(https://drive-thirdparty.+?)\".+\"(https://drive\\.google\\.com.+?)\",.+\\],\"(.+)\"$");

        while (m.find()) {
            String line = m.group().replace("\\u003d", "=").replace("\\u0026", "&");
            System.out.println(line);
            Matcher m2 = p2.matcher(line);
            if (m2.find()) {
                String type = m2.group(1);
                String link = m2.group(2);
                String name = m2.group(3).replace(".mp3", "").replace(".txt", "");

                String id = line.replaceFirst(".+/d/(.+)/view.+", "$1");
                String resourcekey = link.replaceFirst(".+/d/.+resourcekey=(.+?)", "$1");

                if (type.contains("audio/mpeg")) {
                    String c = String.format("%s|%s|%s\r\n", name, id, resourcekey);
                    Files.writeString(outFile, c, StandardCharsets.UTF_8, StandardOpenOption.APPEND);
                }
            }
        }
    }

    public static void main(String[] args) throws IOException {
        // new SetupGoogleDriveLink().listPath("唐詩七絕選賞1.txt");
        new SetupGoogleDriveLink().listPath("唐詩七絕選賞2.txt");
        // new SetupGoogleDriveLink().listPath("唐詩七絕選賞3.txt");
    }
}
