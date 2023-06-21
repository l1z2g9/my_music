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
        String currentPath = "C:/Users/user/Desktop/Forrest/workspace/my_music/server-java-sb/googleDrivePage";

        Path outFile = Paths.get(currentPath, "out.txt");

        Files.writeString(outFile, "", StandardCharsets.UTF_8, StandardOpenOption.TRUNCATE_EXISTING);

        String content = Files.readString(Paths.get(currentPath, filename), StandardCharsets.UTF_8);
        Pattern p = Pattern.compile("\\x22唐詩.+?\\.mp3.+?resourcekey.+?\\x22");
        Matcher m = p.matcher(content);

        // Pattern p2 = Pattern
        // .compile("(https://drive-thirdparty.+?)\".+\"(https://drive\\.google\\.com.+?)\",.+\\],\"(.+)\"$");

        Pattern p2 = Pattern.compile(".+(\u5510\u8A69.+?mp3).+drive.google.com/file/d/(.+)/.+resourcekey=(.+)\"$");

        while (m.find()) {
            String line = m.group().replace("\\u003d", "=").replace("\\u0026", "&");

            Matcher m2 = p2.matcher(line);
            if (m2.find()) {
                // System.out.println("+== " + line);
                String name = m2.group(1).replace(".mp3", "");
                String id = m2.group(2);
                String resourcekey = m2.group(3);
                /* System.out.println(name);
                System.out.println(id);
                System.out.println(resourcekey); */

                String c = String.format("%s|%s|%s\r\n", name, id, resourcekey);
                Files.writeString(outFile, c, StandardCharsets.UTF_8, StandardOpenOption.APPEND);

                // String id = line.replaceFirst(".+/d/(.+)/view.+", "$1");
                /*
                 * String resourcekey = link.replaceFirst(".+/d/.+resourcekey=(.+?)", "$1");
                 * 
                 * if (type.contains("audio/mpeg")) {
                 * String c = String.format("%s|%s|%s\r\n", name, id, resourcekey);
                 * Files.writeString(outFile, c, StandardCharsets.UTF_8,
                 * StandardOpenOption.APPEND);
                 * }
                 */
            }
        }
    }

    public static void main(String[] args) throws IOException {
        // new SetupGoogleDriveLink().listPath("唐詩七絕選賞1.txt");
        new SetupGoogleDriveLink().listPath("唐詩七絕選賞2.txt");
        // new SetupGoogleDriveLink().listPath("唐詩七絕選賞3.txt");
    }
}
